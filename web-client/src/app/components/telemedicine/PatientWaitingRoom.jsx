import { Clock, Video, MessageSquare, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PatientWaitingRoom({ onJoinCall }) {
  const [queuePosition, setQueuePosition] = useState(1);
  const [estimatedWait, setEstimatedWait] = useState(5);
  const [messages] = useState([
    { id: 1, text: 'Please ensure you are in a quiet, well-lit space', type: 'tip' },
    { id: 2, text: 'Have your insurance card ready', type: 'reminder' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEstimatedWait(prev => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const healthTips = [
    {
      title: 'Managing Hypertension',
      description: 'Regular monitoring and lifestyle changes can help control high blood pressure.'
    },
    {
      title: 'Diabetes Care',
      description: 'Maintain consistent meal times and blood sugar monitoring for better control.'
    }
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">Welcome to Your Virtual Visit</h1>
          <p className="text-gray-600">Dr. Smith will be with you shortly</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl mb-1">You're in the Queue</h2>
                <p className="text-gray-600">Position #{queuePosition}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-1">{estimatedWait}</div>
              <p className="text-sm text-gray-600">minutes estimated wait</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm">Camera Ready</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm">Mic Ready</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm">Connection Good</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => onJoinCall('1')} // Simulated patientId
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg font-bold flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Join Meeting Now
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Send Message
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg mb-4">Your Appointment</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor</span>
                <span>Dr. Smith</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span>10:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span>15 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reason</span>
                <span>Follow-up</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg mb-4">Pre-Visit Checklist</h3>
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm text-gray-700">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            While You Wait - Health Tips
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {healthTips.map((tip, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <h4 className="mb-2">{tip.title}</h4>
                <p className="text-sm text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

