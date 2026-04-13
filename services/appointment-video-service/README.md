# Appointment & Consultation Microservice (The Orchestrator)

This service handles booking logic, telemedicine integration (video rooms), and real-time status tracking.

## Tech Stack
- **Node.js & Express**: Backend framework
- **MongoDB & Mongoose**: Permanent storage for bookings and schedules
- **Socket.io**: Real-time updates and signaling
- **Redis**: Caching schedules and tracking online status
- **WebRTC**: For video consultation (integrated with Agora)

## Key Features
- **Booking Logic**: CRUD for appointments with Redis cache invalidation.
- **Telemedicine**: Room ID generation for video sessions.
- **Real-time Status**: Doctor online/offline tracking via WebSockets and Redis.
- **Orchestration**: Managing state transitions (scheduled -> in-progress -> completed).

## Video Call Integration (Agora)
The service generates secure RTC tokens for Agora video calls. 
- **Channel Name**: Uses the `appointmentId`.
- **Token**: Generated server-side using `AGORA_APP_CERTIFICATE`.

### How to use on Frontend:
When an appointment is started, call `/api/consultations/generate-room`. Use the returned data in your `agora-react-uikit`:

```javascript
const { appId, channel, token } = response.data.data;
const rtcProps = { appId, channel, token };

return <AgoraUIKit rtcProps={rtcProps} />;
```

## API Endpoints
- `POST /api/appointments/book`: Book a new slot
- `GET /api/appointments`: List appointments for a user
- `POST /api/consultations/generate-room`: Create a video room
- `GET /api/consultations/status/:appointmentId`: Check session status

## WebSocket Events
- `join`: Join a user-specific room
- `doctor_status_changed`: Broadcast when a doctor connects/disconnects
- `update_appointment_status`: Push live status updates
- `video_signal`: Relay WebRTC signaling data
