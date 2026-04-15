import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DoctorDiscovery from './DoctorDiscovery';
import WaitingRoom from './WaitingRoom';
import CallCanvas from './CallCanvas';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

// Extracted strict State Constraints
const STATES = {
  IDLE: 'IDLE',
  QUEUED: 'QUEUED',
  CONNECTING: 'CONNECTING',
  IN_CALL: 'IN-CALL'
};

export default function VirtualClinicDashboard() {
  const [sessionState, setSessionState] = useState(STATES.IDLE);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [socket, setSocket] = useState(null);
  const [agoraCredentials, setAgoraCredentials] = useState(null);

  useEffect(() => {
    // 3. The Transition Mechanism: WebSockets
    const newSocket = io(API_URL);
    setSocket(newSocket);

    // Dynamic subscription to updates from Orchestrator
    newSocket.on('CALL_INITIATED', (payload) => {
      // payload expects: { appId, channel, token }
      console.log('Call Orchestrator Triggered Activation', payload);
      setAgoraCredentials(payload);

      // Shift out of Queue immediately
      setSessionState(STATES.CONNECTING);
    });

    // Mock testing listener for UI validation without backend fully firing the exact event
    window.addEventListener('simulated-socket-call', (e) => {
      setAgoraCredentials(e.detail);
      setSessionState(STATES.CONNECTING);
    });

    return () => {
      newSocket.disconnect();
      window.removeEventListener('simulated-socket-call', () => { });
    };
  }, []);

  const handleJoinQueue = (doctor) => {
    setSelectedDoctor(doctor);
    setQueuePosition(3);
    setSessionState(STATES.QUEUED);

    // Mock emitting queue join to orchestrator
    if (socket) {
      socket.emit('join_queue', {
        doctorId: doctor.id,
        patientId: 'patient_001' // Mock patient ID matching the test case
      });
    }
  };

  const handleLeaveSession = () => {
    // Complete teardown logic. Unmounts everything.
    setSelectedDoctor(null);
    setAgoraCredentials(null);
    setSessionState(STATES.IDLE);
  };

  // Callback coming deeply from Agora UIKit
  const handleJoinChannelSuccess = () => {
    console.log("Agora P2P Connection Fully Established. Injecting UI.");
    setSessionState(STATES.IN_CALL);
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-gray-50">

      {sessionState === STATES.IDLE && (
        <DoctorDiscovery onJoinQueue={handleJoinQueue} />
      )}

      {sessionState === STATES.QUEUED && (
        <WaitingRoom
          doctor={selectedDoctor}
          position={queuePosition}
          onLeave={handleLeaveSession}
          // The Waiting Room progress debug
          simulateProgress={() => {
            if (queuePosition > 1) {
              setQueuePosition(prev => prev - 1);
            } else {
              // Trigger Simulated WebSocket event
              const event = new CustomEvent('simulated-socket-call', {
                detail: { appId: "mock-id", channel: "mock-channel", token: null }
              });
              window.dispatchEvent(event);
            }
          }}
        />
      )}

      {/* 
        The Connecting Overlay Mechanism
        MANDATORY: We show this while the socket establishes P2P logic in the background 
      */}
      {sessionState === STATES.CONNECTING && (
        <div className="absolute inset-0 z-50 bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">Initializing Video Engine...</h2>
          <p className="text-gray-400 max-w-sm text-center font-medium">
            Doctor {selectedDoctor?.name.split(' ')[1]} has admitted you. Establishing an encrypted P2P bridge via Agora...
          </p>
        </div>
      )}

      {/* 
        The Agora integration remains completely hidden until explicitly 'IN-CALL'.
        Wait: We must mount it during CONNECTING so it can fire handleJoinChannelSuccess!
      */}
      {(sessionState === STATES.CONNECTING || sessionState === STATES.IN_CALL) && agoraCredentials && (
        <div className={`absolute inset-0 w-full h-full z-40 transition-opacity duration-700 ease-in-out ${sessionState === STATES.IN_CALL ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <CallCanvas
            doctor={selectedDoctor}
            agoraCredentials={agoraCredentials}
            onJoinSuccess={handleJoinChannelSuccess}
            onEndCall={handleLeaveSession}
          />
        </div>
      )}
    </div>
  );
}

