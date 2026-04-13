import { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, Phone, FileText, Activity, MessageSquare } from 'lucide-react';

interface ConsultationViewProps {
  patientId: string;
  onEndCall: () => void;
}

export function ConsultationView({ patientId, onEndCall }: ConsultationViewProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');
  const [callDuration, setCallDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<'notes' | 'history' | 'vitals'>('notes');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    <div className="flex-1 flex flex-col h-screen bg-gray-900">
      <div className="flex-1 flex gap-4 p-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative bg-black rounded-xl overflow-hidden flex-1">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl mb-4 mx-auto">
                  SJ
                </div>
                <h3 className="text-white text-2xl mb-2">{patientData.name}</h3>
                <p className="text-gray-400">Patient Video</p>
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionQuality === 'excellent' ? 'bg-green-500' :
                connectionQuality === 'good' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              {connectionQuality === 'excellent' ? 'HD' : connectionQuality === 'good' ? 'SD' : 'Low Quality'}
            </div>

            <div className="absolute bottom-4 left-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-xl mb-2 mx-auto">
                    DS
                  </div>
                  <p className="text-sm">You</p>
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {formatTime(callDuration)}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pb-4">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isMicOn ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isVideoOn ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </button>

            <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
              <Monitor className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={onEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
            >
              <Phone className="w-6 h-6 text-white transform rotate-135" />
            </button>
          </div>
        </div>

        <div className="w-96 bg-white rounded-xl flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl mb-1">{patientData.name}</h2>
            <p className="text-sm text-gray-600">{patientData.age} years • {patientData.gender}</p>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 px-4 py-3 text-sm transition-colors ${
                activeTab === 'notes'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Notes
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-3 text-sm transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              History
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 px-4 py-3 text-sm transition-colors ${
                activeTab === 'vitals'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Vitals
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Consultation Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="AI-assisted scribe will automatically generate notes from the conversation..."
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    AI scribe active • Auto-saving
                  </p>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
