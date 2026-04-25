const Appointment = require('../models/Appointment');
const { generateRtcToken } = require('../config/agora');
const {
  cacheToken,
  getCachedToken,
  invalidateTokens,
  setSessionState,
  getSessionState,
  blacklistSession,
  isSessionBlacklisted,
} = require('../config/redis');

/**
 * Agora RTC Video Session Controller — Redis-enhanced
 *
 * Redis is used at three points:
 *
 *  1. startSession  — writes session state to Redis after DB save.
 *     Subsequent patient polls read from Redis, sparing MongoDB.
 *
 *  2. getToken      — checks Redis blacklist first (fast-fail for ended sessions),
 *     then serves a cached token if one exists and is still valid; otherwise
 *     generates a fresh Agora token, caches it, and returns it.
 *
 *  3. endSession    — blacklists the session in Redis and invalidates any
 *     cached tokens so late-arriving clients are immediately rejected.
 *
 *  4. getSessionStatus — reads from Redis cache first; falls back to MongoDB
 *     only on a cache miss, keeping the patient-polling path very cheap.
 */

// POST /api/sessions/start/:appointmentId
async function startSession(req, res) {
  try {
    const appt = await Appointment.findById(req.params.appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    if (req.userRole !== 'doctor' || appt.doctorId !== req.userId) {
      return res.status(403).json({ error: 'Only the assigned doctor can start a session' });
    }

    if (appt.status !== 'confirmed') {
      return res.status(400).json({ error: 'Appointment must be confirmed before starting a session' });
    }

    const channelName = appt._id.toString();

    const { token, uid, appId, expiresAt, expiresIn } = generateRtcToken(
      channelName, req.userId, 'publisher'
    );

    if (!appt.sessionId) {
      appt.sessionId = channelName;
      appt.agoraAppId = appId;
      appt.sessionStartedAt = new Date();
    }
    await appt.save();

    // Redis: cache doctor token + write live session state
    const tokenData = { token, uid, appId, channelName, expiresAt, expiresIn };
    await Promise.allSettled([
      cacheToken(appt._id.toString(), req.userId, tokenData),
      setSessionState(appt._id.toString(), {
        isActive: true,
        channelName,
        appId,
        sessionStartedAt: appt.sessionStartedAt,
      }),
    ]);

    res.json({
      message: 'Agora session started',
      appointmentId: appt._id,
      appId, channelName, token, uid, expiresAt, expiresIn,
      sessionStartedAt: appt.sessionStartedAt,
    });
  } catch (err) {
    console.error('startSession error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/sessions/token/:appointmentId
async function getToken(req, res) {
  try {
    const appointmentId = req.params.appointmentId;

    // Fast-fail: session already ended
    const blacklisted = await isSessionBlacklisted(appointmentId).catch(() => false);
    if (blacklisted) {
      return res.status(410).json({ error: 'This session has already ended' });
    }

    // Serve from Redis cache if valid token exists
    const cached = await getCachedToken(appointmentId, req.userId).catch(() => null);
    if (cached) {
      return res.json({ ...cached, appointmentId, fromCache: true });
    }

    // Cache miss — go to MongoDB
    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const isParticipant =
      (req.userRole === 'patient' && appt.patientId === req.userId) ||
      (req.userRole === 'doctor' && appt.doctorId === req.userId);

    if (!isParticipant && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'You are not a participant of this appointment' });
    }

    if (!appt.sessionId) {
      const channelName = appt._id.toString();
      const { appId } = generateRtcToken(channelName, req.userId, 'publisher');
      appt.sessionId = channelName;
      appt.agoraAppId = appId;
      appt.sessionStartedAt = new Date();
      await appt.save();
    }

    if (appt.sessionEndedAt) {
      await blacklistSession(appointmentId).catch(() => {});
      return res.status(410).json({ error: 'This session has already ended' });
    }

    const { token, uid, appId, expiresAt, expiresIn } = generateRtcToken(
      appt.sessionId, req.userId, 'publisher'
    );

    const tokenData = { token, uid, appId, channelName: appt.sessionId, expiresAt, expiresIn };
    await cacheToken(appointmentId, req.userId, tokenData).catch((e) =>
      console.warn('[Redis] cacheToken failed (non-fatal):', e.message)
    );

    res.json({ ...tokenData, appointmentId: appt._id, sessionStartedAt: appt.sessionStartedAt, fromCache: false });
  } catch (err) {
    console.error('getToken error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/sessions/end/:appointmentId
async function endSession(req, res) {
  try {
    const appt = await Appointment.findById(req.params.appointmentId);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    if (req.userRole !== 'doctor' || appt.doctorId !== req.userId) {
      return res.status(403).json({ error: 'Only the assigned doctor can end a session' });
    }

    if (!appt.sessionId) {
      return res.status(400).json({ error: 'No active session found for this appointment' });
    }

    if (appt.sessionEndedAt) {
      return res.status(400).json({ error: 'Session already ended' });
    }

    const now = new Date();
    appt.sessionEndedAt = now;
    appt.status = 'completed';

    if (appt.sessionStartedAt) {
      appt.sessionDurationSeconds = Math.round(
        (now.getTime() - appt.sessionStartedAt.getTime()) / 1000
      );
    }

    if (req.body && req.body.doctorNotes) appt.doctorNotes = req.body.doctorNotes;

    await appt.save();

    // Redis: blacklist session + invalidate both participants' cached tokens
    await Promise.allSettled([
      blacklistSession(appt._id.toString()),
      invalidateTokens(appt._id.toString(), appt.doctorId, appt.patientId),
    ]);

    res.json({
      message: 'Session ended successfully',
      appointmentId: appt._id,
      channelName: appt.sessionId,
      sessionStartedAt: appt.sessionStartedAt,
      sessionEndedAt: appt.sessionEndedAt,
      sessionDurationSeconds: appt.sessionDurationSeconds,
    });
  } catch (err) {
    console.error('endSession error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/sessions/status/:appointmentId
async function getSessionStatus(req, res) {
  try {
    const appointmentId = req.params.appointmentId;

    // Redis blacklist check
    const blacklisted = await isSessionBlacklisted(appointmentId).catch(() => false);
    if (blacklisted) {
      return res.json({ appointmentId, isActive: false, fromCache: true });
    }

    // Redis live state cache
    const cached = await getSessionState(appointmentId).catch(() => null);
    if (cached) {
      return res.json({ appointmentId, ...cached, fromCache: true });
    }

    // Cache miss — query MongoDB
    const appt = await Appointment.findById(appointmentId).select(
      'sessionId agoraAppId sessionStartedAt sessionEndedAt sessionDurationSeconds status patientId doctorId'
    );
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    const isParticipant =
      (req.userRole === 'patient' && appt.patientId === req.userId) ||
      (req.userRole === 'doctor' && appt.doctorId === req.userId) ||
      req.userRole === 'admin';

    if (!isParticipant) return res.status(403).json({ error: 'Forbidden' });

    const isActive = !!appt.sessionId && !appt.sessionEndedAt;

    // Backfill Redis from Mongo
    if (isActive) {
      await setSessionState(appointmentId, {
        isActive: true,
        channelName: appt.sessionId,
        appId: appt.agoraAppId,
        sessionStartedAt: appt.sessionStartedAt,
      }).catch(() => {});
    } else if (appt.sessionEndedAt) {
      await blacklistSession(appointmentId).catch(() => {});
    }

    res.json({
      appointmentId: appt._id,
      sessionId: appt.sessionId || null,
      appId: appt.agoraAppId || null,
      isActive,
      appointmentStatus: appt.status,
      sessionStartedAt: appt.sessionStartedAt || null,
      sessionEndedAt: appt.sessionEndedAt || null,
      sessionDurationSeconds: appt.sessionDurationSeconds || null,
      fromCache: false,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { startSession, getToken, endSession, getSessionStatus };
