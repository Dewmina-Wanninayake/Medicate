/**
 * Redis Client Configuration
 *
 * Used by the appointment-video-service for:
 *  1. Caching Agora RTC tokens — avoids re-generating tokens on every request
 *     and allows the client to refresh tokens before they expire.
 *  2. Storing active session state — fast O(1) lookup of whether a session is
 *     live without hitting MongoDB on every patient poll.
 *  3. Token blacklisting — when a session ends, the doctor's token is
 *     invalidated in Redis so late-arriving clients are immediately rejected.
 *
 * Key schema
 * ──────────
 *  token:<appointmentId>:<userId>        → JSON { token, uid, appId, channelName, expiresAt }
 *  session:state:<appointmentId>         → JSON { isActive, startedAt, channelName, appId }
 *  session:blacklist:<appointmentId>     → "1"  (exists = ended)
 *
 * TTLs
 * ────
 *  Token cache  → AGORA_TOKEN_EXPIRY seconds (matches Agora token lifetime)
 *  Session state → 24 h (safety net; mongo is source of truth)
 *  Blacklist    → 24 h  (prevents stale clients from re-joining after end)
 */

const { createClient } = require('redis');

let client = null;
let connected = false;

async function getRedisClient() {
  if (client && connected) return client;

  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('[Redis] Too many reconnect attempts — giving up');
          return new Error('Redis reconnect limit reached');
        }
        return Math.min(retries * 100, 3000); // exponential back-off, max 3 s
      },
    },
  });

  client.on('error', (err) => console.error('[Redis] Client error:', err.message));
  client.on('connect', () => console.log('[Redis] Connected'));
  client.on('reconnecting', () => console.warn('[Redis] Reconnecting…'));
  client.on('end', () => { connected = false; });

  await client.connect();
  connected = true;
  return client;
}

// ── Helper wrappers ──────────────────────────────────────────────────────────

/**
 * Cache an Agora token for a specific (appointment, user) pair.
 * TTL is set to match the token's own expiry so it auto-evicts.
 */
async function cacheToken(appointmentId, userId, tokenData) {
  const redis = await getRedisClient();
  const key = `token:${appointmentId}:${userId}`;
  const ttl = tokenData.expiresIn || parseInt(process.env.AGORA_TOKEN_EXPIRY, 10) || 3600;
  await redis.setEx(key, ttl, JSON.stringify(tokenData));
}

/**
 * Retrieve a cached token. Returns parsed object or null if not found / expired.
 */
async function getCachedToken(appointmentId, userId) {
  const redis = await getRedisClient();
  const raw = await redis.get(`token:${appointmentId}:${userId}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Invalidate all cached tokens for an appointment (called on session end).
 */
async function invalidateTokens(appointmentId, ...userIds) {
  const redis = await getRedisClient();
  const keys = userIds.map((uid) => `token:${appointmentId}:${uid}`);
  if (keys.length) await redis.del(keys);
}

/**
 * Store lightweight session state so patient polling never hits MongoDB.
 */
async function setSessionState(appointmentId, state) {
  const redis = await getRedisClient();
  const SESSION_TTL = 24 * 60 * 60; // 24 h
  await redis.setEx(`session:state:${appointmentId}`, SESSION_TTL, JSON.stringify(state));
}

/**
 * Read session state from Redis. Returns null on cache miss (caller falls back to Mongo).
 */
async function getSessionState(appointmentId) {
  const redis = await getRedisClient();
  const raw = await redis.get(`session:state:${appointmentId}`);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Mark a session as ended in Redis so late-arriving clients are rejected fast.
 */
async function blacklistSession(appointmentId) {
  const redis = await getRedisClient();
  const BLACKLIST_TTL = 24 * 60 * 60; // 24 h
  await redis.setEx(`session:blacklist:${appointmentId}`, BLACKLIST_TTL, '1');
  // Also delete the live state entry
  await redis.del(`session:state:${appointmentId}`);
}

/**
 * Returns true if the session has been blacklisted (ended).
 */
async function isSessionBlacklisted(appointmentId) {
  const redis = await getRedisClient();
  const val = await redis.get(`session:blacklist:${appointmentId}`);
  return val === '1';
}

module.exports = {
  getRedisClient,
  cacheToken,
  getCachedToken,
  invalidateTokens,
  setSessionState,
  getSessionState,
  blacklistSession,
  isSessionBlacklisted,
};
