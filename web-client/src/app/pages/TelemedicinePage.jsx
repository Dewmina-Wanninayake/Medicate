import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { io } from 'socket.io-client';
import AgoraUIKit from 'agora-react-uikit';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ShieldAlert, Activity, FileText, ArrowLeft, Loader2, Video, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import PrescriptionModal from '../components/PrescriptionModal';
import { toast } from 'sonner';

export default function TelemedicinePage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [agoraProps, setAgoraProps] = useState(null);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, waiting, live, completed, error
  const [socket, setSocket] = useState(null);
  const [notes, setNotes] = useState('');
  const [showPrescription, setShowPrescription] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const isDoctor = user?.role === 'doctor';

  const fetchAppointment = useCallback(async () => {
    try {
      const res = await appointmentAPI.list({ appointmentId });
      const apt = res.data.appointments?.[0] || res.data.data?.[0];
      if (apt) {
        setAppointment(apt);
        setNotes(apt.notes || '');
      } else {
        setCallStatus('error');
      }
    } catch (err) {
      console.error('Failed to fetch appointment:', err);
      setCallStatus('error');
    }
  }, [appointmentId]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  useEffect(() => {
    if (!appointment) return;

    let newSocket;

    const setupSession = async () => {
      try {
        setCallStatus('connecting');

        // 1. WebSocket Orchestrator Setup
        const socketUrl = import.meta.env.VITE_APPOINTMENT_SERVICE_URL?.replace('/api', '') || 'http://localhost:5004';
        newSocket = io(socketUrl);
        setSocket(newSocket);
        
        newSocket.on('connect', () => {
          newSocket.emit('join', { appointmentId, userId: user?.userId, role: user?.role });
        });

        newSocket.on('doctor_status_changed', (data) => {
          if (data.status === 'online') {
             setCallStatus('live');
          }
        });

        // 2. Fetch Room Configuration
        const response = await appointmentAPI.generateRoom({
          appointmentId: appointmentId,
          patientId: appointment.patientId
        });

        if (response.data.success) {
          const { appId, channel, token } = response.data.data;
          setAgoraProps({
            appId,
            channel,
            token: token || null,
          });
          
          setCallStatus('waiting');
          // If doctor is already present, status will be updated via socket
          if (isDoctor) setCallStatus('live');
        }
      } catch (err) {
        console.error("Orchestrator Setup Error:", err);
        setCallStatus('error');
      }
    };

    setupSession();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [appointment, appointmentId, user, isDoctor]);

  const handleEndSession = async () => {
    if (socket) {
      socket.emit('update_appointment_status', {
        appointmentId,
        status: 'completed',
        userId: user?.userId
      });
    }
    setCallStatus('completed');
    toast.success('Session ended');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const saveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await appointmentAPI.updateNotes({ appointmentId, notes });
      toast.success('Notes saved');
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (callStatus === 'error' && !appointment) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold">Appointment Not Found</h2>
      <p className="text-muted-foreground mt-2">The session identifier is invalid or has expired.</p>
      <Button onClick={() => navigate('/dashboard')} className="mt-6 rounded-full">Return to Dashboard</Button>
    </div>
  );

  if (!appointment) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              Telemedicine Session
              {callStatus === 'live' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">ID: {appointmentId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge 
            variant="secondary" 
            className={`text-xs px-3 py-1 rounded-full capitalize font-bold ${
              callStatus === 'live' ? 'bg-green-100 text-green-700' : 
              callStatus === 'waiting' ? 'bg-amber-100 text-amber-700' : ''
            }`}
          >
            {callStatus}
          </Badge>
          
          {isDoctor && (
            <Button 
              size="sm" 
              onClick={() => setShowPrescription(true)}
              className="rounded-full bg-primary hover:bg-accent gap-2"
            >
              <ClipboardList className="w-4 h-4" /> Issue Prescription
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 bg-black relative flex items-center justify-center">
          {callStatus === 'connecting' || callStatus === 'waiting' ? (
            <div className="text-center space-y-4 p-10 rounded-3xl bg-card/5 backdrop-blur-md border border-white/10 max-w-sm mx-auto">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                 <Video className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white">
                 {callStatus === 'waiting' ? 'Waiting for Participant' : 'Initializing Call...'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isDoctor ? 'Waiting for patient to join the secure room...' : 'The doctor will be with you shortly. Please stay on this screen.'}
              </p>
            </div>
          ) : callStatus === 'live' && agoraProps ? (
            <div className="w-full h-full">
              <AgoraUIKit 
                rtcProps={{
                  appId: agoraProps.appId,
                  channel: agoraProps.channel,
                  token: agoraProps.token,
                  layout: 1,
                }}
                callbacks={{
                  EndCall: handleEndSession
                }}
              />
            </div>
          ) : (
            <div className="text-white p-6 bg-destructive/20 rounded-2xl border border-destructive/30">
              Session status: <span className="font-bold uppercase">{callStatus}</span>
            </div>
          )}
        </div>

        <aside className="lg:w-[350px] w-full bg-card border-l border-border flex flex-col">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <Card className="rounded-2xl border-none bg-muted/30">
              <CardContent className="p-4 text-sm space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> {isDoctor ? 'Patient Details' : 'Appointment Info'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground uppercase font-bold">Name</span>
                    <p className="font-semibold truncate">{appointment.patientName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase font-bold">Date</span>
                    <p className="font-semibold">{new Date(appointment.startTime).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1 flex flex-col min-h-[300px] border border-border rounded-2xl bg-background overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                 <h3 className="font-bold text-sm flex items-center gap-2">
                   <FileText className="w-4 h-4 text-primary" /> Consultation Notes
                 </h3>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={saveNotes} 
                   disabled={isSavingNotes}
                   className="h-7 text-[10px] uppercase font-black"
                 >
                   {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                 </Button>
              </div>
              <Textarea 
                className="flex-1 resize-none rounded-none border-none p-4 focus-visible:ring-0 text-sm"
                placeholder={isDoctor ? "Write patient observations here..." : "Jot down questions for your doctor..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 border-t border-border bg-muted/10">
            <Button onClick={handleEndSession} variant="destructive" className="w-full rounded-full font-bold">
              End Session
            </Button>
          </div>
        </aside>
      </div>

      <PrescriptionModal 
        open={showPrescription} 
        onClose={() => setShowPrescription(false)} 
        appointment={appointment}
      />
    </div>
  );
}

