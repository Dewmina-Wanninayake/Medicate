import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import { io } from 'socket.io-client';
import AgoraUIKit from 'agora-react-uikit';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ShieldAlert, Activity, FileText, ArrowLeft, Loader2, Video } from 'lucide-react';
import { mockAppointments } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

export default function TelemedicinePage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [agoraProps, setAgoraProps] = useState(null);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, waiting, live, completed, error
  const [socket, setSocket] = useState(null);
  const [notes, setNotes] = useState('');

  // Mock appointment contextual data since we are focusing on orchestrator video logic
  const appointment = mockAppointments.find(a => a.id === appointmentId) || {
    id: appointmentId,
    patientName: 'Jane Doe',
    patientAge: 32,
    bloodGroup: 'O+',
    symptoms: ['Fever', 'Dry Cough', 'Fatigue'],
    specialty: 'General Medicine',
    time: '10:00 AM'
  };

  useEffect(() => {
    let newSocket;

    const setupSession = async () => {
      try {
        setCallStatus('connecting');

        // 1. WebSocket Orchestrator Setup
        newSocket = io(API_URL);
        setSocket(newSocket);
        
        newSocket.on('connect', () => {
          newSocket.emit('join', { userId: appointmentId, role: 'patient' });
        });

        // Listen for Doctor's presence
        newSocket.on('doctor_status_changed', (data) => {
          if (data.status === 'online' && callStatus === 'waiting') {
             setCallStatus('live');
          }
        });

        // 2. Fetch Room Configuration from Appointment Microservice
        const response = await axios.post(`${API_URL}/api/consultations/generate-room`, {
          appointmentId: appointmentId
        });

        if (response.data.success) {
          const { appId, channel, token } = response.data.data;
          setAgoraProps({
            appId: appId,
            channel: channel,
            token: token || null,
          });
          
          // Fallback to live immediately for demonstration
          setCallStatus('waiting');
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
  }, [appointmentId]);

  const handleEndSession = async () => {
    if (socket) {
      socket.emit('update_appointment_status', {
        appointmentId,
        status: 'completed',
        patientId: appointmentId,
        doctorId: 'doctor_1'
      });
    }
    setCallStatus('completed');
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  if (!appointment) return <div className="p-8">Appointment not found</div>;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Real-time Status Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              Telemedicine Session
              {callStatus === 'live' && (
                <span className="flex h-3 w-3 relative ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 font-medium">Session ID: {appointmentId}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge 
            variant="secondary" 
            className={`text-sm px-4 py-1.5 rounded-full capitalize font-semibold shadow-sm transition-colors ${
              callStatus === 'live' ? 'bg-green-100 border-none text-green-700' : 
              callStatus === 'waiting' ? 'bg-amber-100 text-amber-700 border-none' : ''
            }`}
          >
            {callStatus === 'connecting' && 'Connecting...'}
            {callStatus === 'waiting' && 'Waiting for Doctor'}
            {callStatus === 'live' && 'Connected Live'}
            {callStatus === 'completed' && 'Session Completed'}
            {callStatus === 'error' && 'Connection Dropped'}
          </Badge>
        </div>
      </header>

      {/* Main Orchestrator Canvas */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        
        {/* Agora Video Feed Container (70%) */}
        <div className="flex-1 lg:w-[70%] bg-gray-950 relative flex flex-col items-center justify-center overflow-hidden">
          {callStatus === 'connecting' || callStatus === 'waiting' ? (
            <div className="text-center space-y-6 max-w-sm mx-auto p-10 rounded-3xl bg-gray-900/60 backdrop-blur-xl border border-gray-800 shadow-2xl">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="relative bg-primary text-white w-full h-full rounded-full flex items-center justify-center shadow-lg">
                   <Video className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                 {callStatus === 'waiting' ? 'Virtual Waiting Room' : 'Connecting Engine'}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {callStatus === 'connecting' 
                  ? 'Establishing secure socket connection to Member 3 Orchestrator...' 
                  : `Please wait. The specialist has been notified and is currently reviewing your file.`}
              </p>
              
              {/* For testing without doctor triggering websocket */}
              {callStatus === 'waiting' && agoraProps && (
                <Button onClick={() => setCallStatus('live')} variant="outline" className="mt-4 rounded-full border-gray-700 text-gray-300 hover:text-white w-full">
                  [Debug] Proceed to Live Phase
                </Button>
              )}
            </div>
          ) : callStatus === 'live' && agoraProps ? (
            <div className="w-full h-full">
              <AgoraUIKit 
                rtcProps={{
                  appId: agoraProps.appId,
                  channel: agoraProps.channel,
                  token: agoraProps.token,
                  layout: 1, // 1 represents a large screen + smaller PIP screens
                }}
                callbacks={{
                  EndCall: handleEndSession
                }}
                styleProps={{
                  localBtnContainer: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '24px', padding: '10px 20px', gap: '20px' },
                }}
              />
            </div>
          ) : callStatus === 'completed' ? (
            <div className="text-center p-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md">
              <h2 className="text-2xl text-white font-bold mb-3">Session Complete</h2>
              <p className="text-gray-400">The healthcare Orchestrator has updated the record. Safely disconnecting...</p>
            </div>
          ) : (
            <div className="text-white p-6 bg-red-900/50 rounded-2xl">Failed to initialize WebRTC Engine via Orchestrator. Is the backend running?</div>
          )}
        </div>

        {/* Member Context Sidebar (30%) */}
        <aside className="lg:w-[30%] w-full h-[400px] lg:h-auto overflow-y-auto bg-gray-50 flex flex-col p-6 space-y-6 border-l border-gray-200">
          <Card className="rounded-[24px] border border-gray-200 shadow-sm flex-shrink-0 bg-white">
            <CardContent className="p-6 text-sm space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-base border-b border-gray-100 pb-3">
                <Activity className="w-5 h-5 text-primary" /> Member Medical Profile
              </h3>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Patient Name</span>
                  <div className="font-semibold text-gray-900 mt-1">{appointment.patientName}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Age/Vitals</span>
                  <div className="font-semibold text-gray-900 mt-1">{appointment.patientAge} yrs • {appointment.bloodGroup}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border shadow-sm flex-shrink-0 bg-gradient-to-br from-indigo-50 to-white">
            <CardContent className="p-6">
              <h3 className="font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-indigo-500" /> Reason for Visit (From Booking)
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {appointment.symptoms.map(s => (
                  <Badge key={s} variant="outline" className="bg-white border-indigo-200 text-indigo-700 rounded-lg font-medium">{s}</Badge>
                ))}
              </div>
              <p className="text-sm text-indigo-800/80 leading-relaxed bg-white/60 p-4 rounded-xl border border-indigo-100">
                Patient scheduled this session expressing symptoms matched by the AI engine. Pending specialist validation.
              </p>
            </CardContent>
          </Card>

          <div className="flex-1 flex flex-col min-h-[250px] bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
               <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-primary" /> In-Call Workspace & Notes
               </h3>
            </div>
            <Textarea 
              className="flex-1 resize-none rounded-none border-none bg-white p-6 shadow-none focus-visible:ring-0 text-sm leading-relaxed"
              placeholder="Real-time workspace. Doctors can push instructions here, and you can type down personal symptoms before bringing them up."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </aside>

      </div>
    </div>
  );
}
