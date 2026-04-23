import { useRef, useEffect } from 'react';
import { useTelemedicine } from '../../context/TelemedicineContext';
import { Button } from '../ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TelemedicinePiP() {
  const { 
    joined, isPipActive, setIsPipActive, remoteUser, 
    isMuted, isVideoOff, toggleMute, toggleVideo, leaveSession, localTracks
  } = useTelemedicine();
  
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (isPipActive && remoteUser && remoteVideoRef.current) {
      remoteUser.videoTrack?.play(remoteVideoRef.current);
    }
  }, [isPipActive, remoteUser]);

  if (!joined || !isPipActive) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 h-48 bg-neutral-900 rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden z-[9999] animate-in slide-in-from-bottom-10 duration-500">
      <div ref={remoteVideoRef} className="w-full h-full bg-black">
        {!remoteUser && (
          <div className="flex items-center justify-center h-full text-white/40 text-xs font-black uppercase tracking-widest animate-pulse">
            Waiting for participant...
          </div>
        )}
      </div>

      <div className="absolute top-3 left-3 bg-red-500 text-[10px] font-black px-2 py-0.5 rounded-full text-white animate-pulse">
        LIVE
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
        <Button size="icon" variant="ghost" onClick={toggleMute} className={`w-8 h-8 rounded-full ${isMuted ? 'bg-red-500' : 'bg-white/10'} text-white`}>
          {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
        </Button>
        <Button size="icon" variant="ghost" onClick={toggleVideo} className={`w-8 h-8 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-white/10'} text-white`}>
          {isVideoOff ? <VideoOff size={14} /> : <Video size={14} />}
        </Button>
        <Button size="icon" variant="ghost" onClick={leaveSession} className="w-8 h-8 rounded-full bg-red-500 text-white">
          <PhoneOff size={14} />
        </Button>
        <Link to="/telemedicine" onClick={() => setIsPipActive(false)}>
          <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full bg-white/10 text-white">
            <Maximize2 size={14} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
