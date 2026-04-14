import { Activity, Heart, Droplet, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function MonitoringDashboard() {
  const heartRateData = [
    { time: '00:00', value: 68 },
    { time: '04:00', value: 62 },
    { time: '08:00', value: 72 },
    { time: '12:00', value: 78 },
    { time: '16:00', value: 75 },
    { time: '20:00', value: 70 },
    { time: '24:00', value: 66 }
  ];

  const bloodPressureData = [
    { time: '6 AM', systolic: 128, diastolic: 82 },
    { time: '9 AM', systolic: 132, diastolic: 85 },
    { time: '12 PM', systolic: 135, diastolic: 88 },
    { time: '3 PM', systolic: 130, diastolic: 84 },
    { time: '6 PM', systolic: 128, diastolic: 82 },
    { time: '9 PM', systolic: 125, diastolic: 80 }
  ];

  const patients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      status: 'normal',
      vitals: { hr: 72, bp: '128/82', glucose: 105, spo2: 98 },
      lastSync: '2 min ago',
      alerts: []
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'MC',
      status: 'warning',
      vitals: { hr: 88, bp: '142/92', glucose: 180, spo2: 96 },
      lastSync: '5 min ago',
      alerts: ['Elevated BP', 'High glucose']
    },
    {
      id: '3',
      name: 'Emma Davis',
      avatar: 'ED',
      status: 'normal',
      vitals: { hr: 68, bp: '118/75', glucose: 95, spo2: 99 },
      lastSync: '1 min ago',
      alerts: []
    },
    {
      id: '4',
      name: 'James Wilson',
      avatar: 'JW',
      status: 'critical',
      vitals: { hr: 105, bp: '158/98', glucose: 210, spo2: 94 },
      lastSync: '30 sec ago',
      alerts: ['High BP', 'Tachycardia', 'Critical glucose']
    }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Remote Patient Monitoring</h1>
          <p className="text-gray-600">Real-time vital signs from connected devices</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">12</div>
            <div className="text-sm text-gray-600">Active Patients</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">3</div>
            <div className="text-sm text-gray-600">Alerts</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">98%</div>
            <div className="text-sm text-gray-600">Avg Compliance</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">45</div>
            <div className="text-sm text-gray-600">Readings Today</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl mb-6">24-Hour Heart Rate Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={heartRateData}>
                <defs>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[50, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#colorHr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl mb-6">Blood Pressure Readings</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[60, 160]} />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-600">Systolic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">Diastolic</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl">Patient Vitals Overview</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {patients.map(patient => (
              <div key={patient.id} className={`p-6 ${patient.status === 'critical' ? 'bg-red-50' : patient.status === 'warning' ? 'bg-yellow-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      {patient.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg">{patient.name}</h3>
                        {patient.status === 'critical' && (
                          <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Critical
                          </span>
                        )}
                        {patient.status === 'warning' && (
                          <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-sm flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Warning
                          </span>
                        )}
                      </div>
                      {patient.alerts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {patient.alerts.map((alert, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                              {alert}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center mb-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">HR</span>
                      </div>
                      <div className={patient.vitals.hr > 100 ? 'text-red-600' : ''}>{patient.vitals.hr}</div>
                      <div className="text-xs text-gray-500">bpm</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center mb-1">
                        <Activity className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">BP</span>
                      </div>
                      <div className={patient.vitals.bp.startsWith('14') || patient.vitals.bp.startsWith('15') ? 'text-red-600' : ''}>{patient.vitals.bp}</div>
                      <div className="text-xs text-gray-500">mmHg</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center mb-1">
                        <Droplet className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Glucose</span>
                      </div>
                      <div className={patient.vitals.glucose > 140 ? 'text-red-600' : ''}>{patient.vitals.glucose}</div>
                      <div className="text-xs text-gray-500">mg/dL</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center mb-1">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">SpO2</span>
                      </div>
                      <div className={patient.vitals.spo2 < 95 ? 'text-red-600' : ''}>{patient.vitals.spo2}%</div>
                      <div className="text-xs text-gray-500">oxygen</div>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-xs text-gray-500 mb-2">{patient.lastSync}</div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}





