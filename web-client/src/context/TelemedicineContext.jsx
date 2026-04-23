import { createContext, useContext, useState, useRef, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { appointmentsAPI, sessionsAPI } from '../services/api';
import { toast } from 'sonner';

const TelemedicineContext = createContext();

export function TelemedicineProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const [joined, setJoined] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const clientRef = useRef(null);
  const localTracksRef = useRef({ video: null, audio: null });

  const joinSession = async (appointment, user) => {
    try {
      const appointmentId = appointment._id;
      if (user.role === 'doctor') {
        try {
          await sessionsAPI.start(appointmentId);
        } catch (e) {
          console.log("Session might already be started", e);
        }
      }

      const sessionData = await sessionsAPI.getToken(appointmentId);
      const { appId, channelName, token, uid } = sessionData;

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (u, mediaType) => {
        await client.subscribe(u, mediaType);
        if (mediaType === "video") {
          setRemoteUser(u);
        }
        if (mediaType === "audio") {
          u.audioTrack.play();
        }
      });

      client.on("user-unpublished", (u) => {
        if (u.uid === remoteUser?.uid) {
          setRemoteUser(null);
        }
      });

      await client.join(appId, channelName, token, uid);

      try {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { video: videoTrack, audio: audioTrack };
        await client.publish([audioTrack, videoTrack]);
      } catch (err) {
        console.warn('Failed to access camera/microphone:', err);
        toast.error('Could not access camera or microphone. You have joined the session as a viewer.');
        setIsVideoOff(true);
        setIsMuted(true);
      }
      
      setActiveSession(appointment);
      setJoined(true);
      toast.success("Joined clinical session");

    } catch (err) {
      console.error("Agora join failed", err);
      toast.error(err.response?.data?.error || "Failed to connect to video server");
      throw err;
    }
  };

  const leaveSession = async () => {
    if (localTracksRef.current.audio) {
      localTracksRef.current.audio.close();
    }
    if (localTracksRef.current.video) {
      localTracksRef.current.video.close();
    }
    if (clientRef.current) {
      await clientRef.current.leave();
    }
    setJoined(false);
    setActiveSession(null);
    setRemoteUser(null);
    setIsPipActive(false);
  };

  const toggleMute = async () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (localTracksRef.current.audio) {
      localTracksRef.current.audio.setEnabled(nextState);
    } else if (nextState === false) {
      // User is trying to unmute but no track exists, try to acquire
      try {
        const audioTrack = await AgoraRTC.createMicrophoneTrack();
        localTracksRef.current.audio = audioTrack;
        if (clientRef.current && joined) {
          await clientRef.current.publish(audioTrack);
        }
      } catch (e) {
        console.error("Still cannot access microphone", e);
        setIsMuted(true);
        toast.error("Microphone access still denied.");
      }
    }
  };

  const toggleVideo = async () => {
    const nextState = !isVideoOff;
    setIsVideoOff(nextState);
    if (localTracksRef.current.video) {
      localTracksRef.current.video.setEnabled(nextState);
    } else if (nextState === false) {
      // User is trying to turn on camera but no track exists
      try {
        const videoTrack = await AgoraRTC.createCameraTrack();
        localTracksRef.current.video = videoTrack;
        if (clientRef.current && joined) {
          await clientRef.current.publish(videoTrack);
        }
      } catch (e) {
        console.error("Still cannot access camera", e);
        setIsVideoOff(true);
        toast.error("Camera access still denied.");
      }
    }
  };

  return (
    <TelemedicineContext.Provider value={{
      activeSession,
      isPipActive,
      setIsPipActive,
      joined,
      remoteUser,
      isMuted,
      isVideoOff,
      localTracks: localTracksRef.current,
      joinSession,
      leaveSession,
      toggleMute,
      toggleVideo
    }}>
      {children}
    </TelemedicineContext.Provider>
  );
}

export const useTelemedicine = () => useContext(TelemedicineContext);
