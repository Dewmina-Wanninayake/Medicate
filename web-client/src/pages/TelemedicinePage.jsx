import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users, Settings, Maximize, FileText, Activity } from 'lucide-react';

export default function TelemedicinePage() {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] p-1">
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex-1 relative rounded-[40px] bg-neutral-900 overflow-hidden shadow-2xl border-4 border-white/10">
          <div className="absolute inset-0 flex items-center justify-center">
            {isVideoOff ? (
              <div className="w-32 h-32 rounded-full bg-neutral-800 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">DR</span>
              </div>
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1200&auto=format&fit=crop" 
                alt="Doctor" 
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="absolute top-6 left-6 flex items-center gap-3">
            <Badge className="bg-red-500 hover:bg-red-500 text-white border-none rounded-full px-4 py-1 animate-pulse">
              LIVE
            </Badge>
            <div className="bg-black/40 backdrop-blur-md px-4 py-1 rounded-full text-white font-mono text-sm">
              {formatTime(timer)}
            </div>
          </div>

          <div className="absolute bottom-6 right-6 w-48 h-64 rounded-3xl bg-neutral-800 border-2 border-white/20 shadow-2xl overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
              <User className="w-12 h-12 text-white/20" />
              <p className="absolute bottom-4 left-4 text-xs text-white font-medium">You (Patient)</p>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-[32px] border border-white/10">
            <Button size="icon" variant="ghost" onClick={() => setIsMuted(!isMuted)} className={`rounded-full w-14 h-14 ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {isMuted ? <MicOff /> : <Mic />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsVideoOff(!isVideoOff)} className={`rounded-full w-14 h-14 ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              {isVideoOff ? <VideoOff /> : <Video />}
            </Button>
            <Button size="icon" variant="ghost" className="rounded-full w-14 h-14 bg-red-500 text-white hover:bg-red-600">
              <PhoneOff />
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-6">
        <Card className="rounded-[32px] border-none shadow-lg bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Patient Details
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-2xl">
                <p className="text-xs text-muted-foreground">Patient Name</p>
                <p className="font-bold">{user?.firstName || 'John'} {user?.lastName || 'Doe'}</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl">
                <p className="text-xs text-muted-foreground">Reason for Visit</p>
                <p className="font-bold">Persistent Headache</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 rounded-[32px] border-none shadow-lg bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col">
          <CardContent className="p-6 flex flex-col h-full">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Chat
            </h3>
            <div className="flex-1 bg-muted/30 rounded-2xl p-4 mb-4 overflow-y-auto">
              <div className="space-y-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-none text-sm ml-8">
                  Hello Dr. Sarah, I've been feeling some pressure in my temples.
                </div>
                <div className="bg-muted p-3 rounded-2xl rounded-tl-none text-sm mr-8">
                  I understand. How long has this been occurring?
                </div>
              </div>
            </div>
            <div className="relative">
              <Input placeholder="Type message..." className="rounded-full pr-12 h-12 bg-white border-none shadow-sm" />
              <Button size="icon" variant="ghost" className="absolute right-1 top-1 rounded-full text-primary">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function User({ className }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
}
function ChevronRight({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>;
}
