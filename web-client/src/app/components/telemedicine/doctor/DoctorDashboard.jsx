import { Video, Calendar, MessageSquare, Clock, Activity } from 'lucide-react';
import { useState } from 'react';





export function DoctorDashboard({ onStartCall, onNavigate }) {
  const [patients] = useState([
    {
      id: 'patient_001',
      name: 'Sarah Johnson',
      time: '10:00 AM',
      status: 'waiting',
      avatar: 'SJ',
      reason: 'Follow-up consultation',
      duration: '15 min'
    },
    {
      id: '2',
      name: 'Michael Chen',
      time: '10:30 AM',
      status: 'scheduled',
      avatar: 'MC',
      reason: 'Initial consultation',
      duration: '30 min'
    },
    {
      id: '3',
      name: 'Emma Davis',
      time: '11:00 AM',
      status: 'scheduled',
      avatar: 'ED',
      reason: 'Prescription renewal',
      duration: '15 min'
    },
    {
      id: '4',
      name: 'James Wilson',
      time: '11:30 AM',
      status: 'scheduled',
      avatar: 'JW',
      reason: 'Blood pressure review',
      duration: '20 min'
    }
  ]);

  const stats = [
    { label: "Today's Appointments", value: '8', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Waiting Patients', value: '1', icon: Clock, color: 'bg-orange-500' },
    { label: 'Unread Messages', value: '5', icon: MessageSquare, color: 'bg-green-500' },
    { label: 'Active Monitors', value: '12', icon: Activity, color: 'bg-purple-500' }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Good morning, Dr. Smith</h1>
            <p className="text-gray-600">Monday, April 13, 2026</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate('monitoring')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Activity className="w-5 h-5 inline mr-2" />
              Monitoring
            </button>
            <button
              onClick={() => onNavigate('messages')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Messages
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl">Today's Schedule</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      {patient.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg">{patient.name}</h3>
                        {patient.status === 'waiting' && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                            Waiting
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{patient.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-gray-900">{patient.time}</div>
                      <div className="text-sm text-gray-500">{patient.duration}</div>
                    </div>
                    <button
                      onClick={() => onStartCall(patient.id)}
                      className={`px-6 py-3 rounded-lg transition-all ${patient.status === 'waiting'
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/30 animate-pulse'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      <Video className="w-5 h-5 inline mr-2" />
                      {patient.status === 'waiting' ? 'Join Now' : 'Start Call'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('schedule')}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <Calendar className="w-5 h-5 inline mr-3" />
                View Full Calendar
              </button>
              <button
                onClick={() => onNavigate('prescriptions')}
                className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                E-Prescriptions
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg mb-4">Upcoming</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Afternoon appointments</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">4</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Pending prescriptions</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">2</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Lab results ready</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





