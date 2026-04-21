/**
 * Agora RTC Token Generator
 *
 * Uses the official `agora-token` npm package to generate short-lived
 * RTC tokens for both host (publisher) and audience (subscriber) roles.
 *
 * Agora token privilege roles:
 *   Role.PUBLISHER  → can publish audio/video (doctor & patient both publish)
 *   Role.SUBSCRIBER → receive-only
 *
 * Token expiry is relative to the current UTC time.
 *
 * Docs: https://docs.agora.io/en/video-calling/get-started/authentication-workflow
 */

const { RtcTokenBuilder, RtcRole } = require('agora-token');

/**
 * Generate an Agora RTC token.
 *
 * @param {string} channelName  - Agora channel name (= our sessionId / appointmentId)
 * @param {string} uid          - Numeric user ID string (we derive from userId hash)
 * @param {'publisher'|'subscriber'} role
 * @returns {{ token: string, uid: number, channelName: string, expiresAt: number }}
 */
function generateRtcToken(channelName, uid, role = 'publisher') {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    throw new Error('AGORA_APP_ID and AGORA_APP_CERTIFICATE must be set in environment');
  }

  const agoraRole = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

  const tokenExpirySeconds = parseInt(process.env.AGORA_TOKEN_EXPIRY, 10) || 3600;
  const privilegeExpirySeconds = tokenExpirySeconds;

  // Agora expects a numeric UID; we convert the userId string to a stable 32-bit int
  const numericUid = typeof uid === 'number' ? uid : deriveNumericUid(uid);

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const tokenExpireTs = currentTimestamp + tokenExpirySeconds;
  const privilegeExpireTs = currentTimestamp + privilegeExpirySeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    numericUid,
    agoraRole,
    tokenExpireTs,
    privilegeExpireTs
  );

  return {
    token,
    uid: numericUid,
    channelName,
    appId,
    expiresAt: tokenExpireTs,
    expiresIn: tokenExpirySeconds,
  };
}

/**
 * Derive a stable 32-bit unsigned integer from a MongoDB ObjectId string.
 * Agora UIDs must be 32-bit unsigned integers (0 means server assigns one).
 * We take the last 8 hex chars of the ObjectId → parse as hex → mask to 32 bits.
 */
function deriveNumericUid(userIdString) {
  const hex = userIdString.replace(/[^0-9a-f]/gi, '').slice(-8);
  return (parseInt(hex, 16) >>> 0) || Math.floor(Math.random() * 0xffffffff);
}

module.exports = { generateRtcToken, deriveNumericUid };
