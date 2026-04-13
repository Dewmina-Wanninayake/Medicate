import { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, Phone, FileText, Activity, MessageSquare, Loader2 } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';
import AgoraCall from '../AgoraCall';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

export function ConsultationView({ patientId, onEndCall }) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('notes');
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [agoraConfig, setAgoraConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    const fetchAgoraCredentials = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_URL}/api/consultations/generate-room`, {
          patientId: patientId
        });
        
        if (response.data.success) {
          const config = response.data.data;
          setAgoraConfig(config);
          
          // Notify the patient via socket that the call is starting
          newSocket.emit('start_call', {
            doctorId: 'doctor_001', // Mock doctor ID
            patientId: patientId,
            ...config
          });
        } else {
          setError('Failed to initialize call credentials');
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('No active telemedicine appointment found for this patient.');
        } else {
          console.error('Error fetching Agora credentials:', err);
          setError('Connection to video server failed');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAgoraCredentials();

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      newSocket.disconnect();
    };
  }, [patientId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveNotes = async () => {
    try {
      setIsSaving(true);
      // Actual implementation would use axios.patch
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Notes saved successfully');
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const patientData = {
    name: 'Sarah Johnson',
    age: 34,
    gender: 'Female',
    lastVisit: '2026-03-15',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg'],
    vitals: {
      heartRate: 72,
      bloodPressure: '128/82',
      temperature: 98.6,
      oxygenSaturation: 98
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="relative bg-muted/20 rounded-[2.5rem] overflow-hidden flex-1 border border-primary/10 backdrop-blur-sm flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-primary font-semibold tracking-wide">Securing connection...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-destructive/20 shadow-2xl">
                <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoOff className="w-8 h-8" />
                </div>
                <h3 className="text-destructive font-bold text-xl mb-2">Video Engine Error</h3>
                <p className="text-slate-600 mb-6 font-medium">{error}</p>
                <button onClick={onEndCall} className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg font-semibold active:scale-[0.98]">
                  Return to Dashboard
                </button>
              </div>
            ) : agoraConfig ? (
              <>
                <AgoraCall 
                  appId={agoraConfig.appId}
                  channelName={agoraConfig.channel} 
                  token={agoraConfig.token}
                  onEndCall={onEndCall} 
                />
                
                <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-xl border border-white/20 text-primary px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-3 z-10 shadow-lg">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="tracking-widest uppercase">Live Session</span>
                  <span className="font-mono bg-primary/10 px-2 py-0.5 rounded-md">{formatTime(callDuration)}</span>
                </div>
              </>
            ) : null}
          </div>

          <div className="flex items-center justify-center gap-4 pb-2">
            <button
              onClick={onEndCall}
              className="w-16 h-16 rounded-[1.5rem] bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
              title="End Meeting"
            >
              <Phone className="w-7 h-7 transform rotate-135 group-hover:rotate-0 transition-transform duration-300" />
            </button>
          </div>
        </div>

        <div className="w-96 bg-white rounded-xl flex flex-col shadow-sm border border-border">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-1">{patientData.name}</h2>
            <p className="text-sm text-gray-600">{patientData.age} years • {patientData.gender}</p>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-primary/5 text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-primary/5 text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              History
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'vitals'
                  ? 'bg-primary/5 text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Vitals
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'notes' && (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Consultation Notes</label>
                    <button 
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Draft'}
                    </button>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="AI-assisted scribe will automatically generate notes from the conversation..."
                    className="w-full flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-3 px-1">
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      AI scribe active • Auto-saving
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {notes.length} characters
                    </span>
                  </div>
                </div>
                <button className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-semibold shadow-md shadow-primary/20 active:scale-[0.98]">
                  Generate Prescription
                </button>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm mb-2">Chronic Conditions</h3>
                  <div className="space-y-2">
                    {patientData.conditions.map((condition, idx) => (
                      <div key={idx} className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm">
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm mb-2">Allergies</h3>
                  <div className="space-y-2">
                    {patientData.allergies.map((allergy, idx) => (
                      <div key={idx} className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                        ⚠️ {allergy}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm mb-2">Current Medications</h3>
                  <div className="space-y-2">
                    {patientData.medications.map((med, idx) => (
                      <div key={idx} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        {med}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-500">Last visit: {patientData.lastVisit}</p>
                </div>
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Heart Rate</div>
                    <div className="text-2xl">{patientData.vitals.heartRate}</div>
                    <div className="text-xs text-gray-500">bpm</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">SpO2</div>
                    <div className="text-2xl">{patientData.vitals.oxygenSaturation}%</div>
                    <div className="text-xs text-gray-500">oxygen</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Blood Pressure</div>
                    <div className="text-2xl">{patientData.vitals.bloodPressure}</div>
                    <div className="text-xs text-gray-500">mmHg</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Temperature</div>
                    <div className="text-2xl">{patientData.vitals.temperature}°F</div>
                    <div className="text-xs text-gray-500">body temp</div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Elevated blood pressure detected. Consider medication adjustment.
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Last synced from wearable: 2 minutes ago
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





