import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, 
  Users, Settings, Maximize, FileText, Activity, AlertCircle,
  Loader2, User
} from 'lucide-react';
import { appointmentsAPI, sessionsAPI } from '../services/api';
import { toast } from 'sonner';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useTelemedicine } from '../context/TelemedicineContext';

export default function TelemedicinePage() {
  const { user } = useAuth();
  const { 
    joined, activeSession, remoteUser, isMuted, isVideoOff, 
    joinSession, leaveSession, toggleMute, toggleVideo, setIsPipActive, localTracks
  } = useTelemedicine();
  
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(!joined);
  
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const chatEndRef = useRef(null);

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  // Poll for chat messages
  useEffect(() => {
    if (!activeSession?._id) return;
    const fetchChat = async () => {
      try {
        const appt = await appointmentsAPI.getById(activeSession._id);
        if (appt.chat) setChatMessages(appt.chat);
      } catch (err) {
        console.error('Failed to fetch chat', err);
      }
    };
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [activeSession?._id]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeSession?._id) return;
    try {
      const msgs = await appointmentsAPI.addChat(activeSession._id, chatInput);
      setChatMessages(msgs);
      setChatInput('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleToggleMute = () => {
    toggleMute();
    toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const handleToggleVideo = () => {
    toggleVideo();
    toast.success(isVideoOff ? 'Camera turned on' : 'Camera turned off');
  };

  useEffect(() => {
    const findActiveSession = async () => {
      if (!user || joined) return; 
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');

        const appointments = await appointmentsAPI.list();
        
        let active;
        if (urlId) {
          active = appointments.find(a => a._id === urlId);
        } else {
          // Fallback: any confirmed or pending video session for today
          active = appointments.find(a => 
            (a.status === 'confirmed' || a.status === 'pending') && 
            a.consultationType === 'video'
          );
        }
        
        if (active) {
          await joinSession(active, user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    findActiveSession();
  }, [user, joined]);

  useEffect(() => {
    if (joined && localTracks?.video && localVideoRef.current) {
      localTracks.video.play(localVideoRef.current);
    }
  }, [joined, localTracks]);

  useEffect(() => {
    if (joined && remoteUser && remoteVideoRef.current) {
      remoteUser.videoTrack?.play(remoteVideoRef.current);
    }
  }, [joined, remoteUser]);

  const handleEndCall = async () => {
    if (confirm("Are you sure you want to end this consultation?")) {
      await leaveSession();
      window.location.href = '/appointments';
    }
  };

  const handleBack = () => {
    setIsPipActive(true);
    window.history.back();
  };

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-xl font-bold text-muted-foreground tracking-tight">Connecting to Clinical Session...</p>
      </div>
    );
  }

  if (!joined && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-6 p-10 text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500">
          <AlertCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-primary">No Active Session</h2>
          <p className="text-xl text-muted-foreground max-w-md">You don't have any confirmed video consultations scheduled for right now.</p>
        </div>
        <Button onClick={() => window.location.href = '/appointments'} className="rounded-full h-14 px-10 text-lg font-bold">
          Go to Scheduler
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] lg:h-[calc(100vh-140px)] p-1">
      <div className="flex-1 flex flex-col gap-6 min-h-[500px] lg:min-h-0">
        <div className="flex-1 relative rounded-[40px] bg-neutral-900 overflow-hidden shadow-2xl border-4 border-white/10">
          {/* Remote Video */}
          <div ref={remoteVideoRef} className="absolute inset-0 flex items-center justify-center bg-black">
            {!remoteUser && (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-neutral-800 flex items-center justify-center mx-auto border-4 border-white/5 shadow-2xl">
                  <span className="text-3xl md:text-4xl font-bold text-white">
                    {user.role === 'doctor' ? 'P' : 'DR'}
                  </span>
                </div>
                <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs md:text-sm animate-pulse">
                  Waiting for {user.role === 'doctor' ? 'Patient' : 'Doctor'}...
                </p>
              </div>
            )}
          </div>

          <div className="absolute top-6 left-6 flex flex-wrap items-center gap-3 z-10">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="bg-black/40 backdrop-blur-md text-white rounded-full px-4 h-10 hover:bg-black/60 font-black flex items-center gap-2"
            >
              <ChevronRightIcon className="w-4 h-4 rotate-180" /> Back
            </Button>
            <Badge className="bg-red-500 hover:bg-red-500 text-white border-none rounded-full px-4 py-1 animate-pulse font-black">
              LIVE
            </Badge>
            <div className="bg-black/40 backdrop-blur-md px-4 py-1 rounded-full text-white font-black text-sm border border-white/10 hidden sm:block">
              {formatTime(timer)}
            </div>
          </div>

          {/* Local Video (Self) */}
          <div className="absolute top-24 right-4 md:top-auto md:bottom-6 md:right-6 w-24 h-36 md:w-48 md:h-64 rounded-[24px] bg-neutral-800 border-2 border-white/20 shadow-2xl overflow-hidden z-10">
             <div ref={localVideoRef} className="w-full h-full bg-neutral-700" />
             {isVideoOff && (
               <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                  <VideoOff className="w-8 h-8 md:w-12 md:h-12 text-white/20" />
               </div>
             )}
             <p className="absolute bottom-2 left-2 text-[8px] md:text-[10px] bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-white font-black uppercase tracking-widest hidden sm:block">
               You ({user.role})
             </p>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4 bg-black/40 backdrop-blur-xl p-3 md:p-4 rounded-[32px] border border-white/10 z-10 w-auto">
            <Button size="icon" variant="ghost" onClick={handleToggleMute} className={`rounded-full w-14 h-14 transition-all ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={handleToggleVideo} className={`rounded-full w-14 h-14 transition-all ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={handleEndCall} className="rounded-full w-14 h-14 bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30">
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-6">
        <Card className="rounded-[32px] border-none shadow-xl bg-white overflow-hidden">
          <CardContent className="p-8">
            <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-primary uppercase tracking-widest">
              <Activity className="w-6 h-6" /> Case File
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Assigned Specialist</p>
                <p className="font-black text-primary">
                  {user.role === 'doctor' ? 'Dr. Kasun Perera (Self)' : 'Dr. Kasun Perera'}
                </p>
              </div>
              <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Chief Complaint</p>
                <p className="font-black text-primary leading-tight">{activeSession?.reasonForVisit || 'Specialized Cardiology Consultation'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-[32px] border-none shadow-xl bg-white overflow-hidden flex flex-col">
          <CardContent className="p-6 md:p-8 flex flex-col h-full">
            <h3 className="font-black text-xl mb-4 md:mb-6 flex items-center gap-3 text-primary uppercase tracking-widest">
              <MessageSquare className="w-6 h-6" /> Secure Chat
            </h3>
            <div className="flex-1 bg-muted/20 rounded-[32px] p-4 md:p-6 mb-4 md:mb-6 overflow-y-auto space-y-4 flex flex-col min-h-[200px]">
              {chatMessages.length === 0 ? (
                <div className="space-y-4 text-center py-10 opacity-40 m-auto">
                  <Users className="w-12 h-12 mx-auto" />
                  <p className="text-sm font-bold">Secure end-to-end encrypted chat is active.</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMe = msg.senderId === user._id;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}>
                      <span className="text-[10px] font-bold text-muted-foreground ml-2 mb-1">{isMe ? 'You' : msg.senderName}</span>
                      <div className={`px-4 py-2 rounded-2xl max-w-[85%] break-words ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white shadow-sm rounded-bl-sm text-foreground'}`}>
                        <p className="text-sm font-medium">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="relative">
              <Input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message your specialist..." 
                className="rounded-full pr-14 h-14 bg-muted/30 border-none font-medium px-6" 
              />
              <Button type="submit" disabled={!chatInput.trim()} size="icon" className="absolute right-1.5 top-1.5 rounded-full w-11 h-11 bg-primary text-white shadow-lg">
                <ChevronRightIcon className="w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChevronRightIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>;
}
