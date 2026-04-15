import { Activity, Heart, Droplet, TrendingUp, Plus, Watch, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function HealthTracking() {
  const [showAddVital, setShowAddVital] = useState(false);

  const bloodPressureData = [
    { date: 'Apr 7', systolic: 128, diastolic: 82 },
    { date: 'Apr 8', systolic: 125, diastolic: 80 },
    { date: 'Apr 9', systolic: 130, diastolic: 85 },
    { date: 'Apr 10', systolic: 132, diastolic: 84 },
    { date: 'Apr 11', systolic: 128, diastolic: 82 },
    { date: 'Apr 12', systolic: 126, diastolic: 80 },
    { date: 'Apr 13', systolic: 127, diastolic: 81 }
  ];

  const glucoseData = [
    { date: 'Apr 7', value: 105 },
    { date: 'Apr 8', value: 98 },
    { date: 'Apr 9', value: 110 },
    { date: 'Apr 10', value: 102 },
    { date: 'Apr 11', value: 95 },
    { date: 'Apr 12', value: 108 },
    { date: 'Apr 13', value: 100 }
  ];

  const weightData = [
    { date: 'Apr 7', value: 165 },
    { date: 'Apr 8', value: 164.5 },
    { date: 'Apr 9', value: 164.8 },
    { date: 'Apr 10', value: 164.2 },
    { date: 'Apr 11', value: 163.9 },
    { date: 'Apr 12', value: 163.5 },
    { date: 'Apr 13', value: 163.2 }
  ];

  const connectedDevices = [
    { name: 'Apple Watch Series 9', type: 'Smartwatch', status: 'connected', lastSync: '5 min ago' },
    { name: 'Omron Blood Pressure Monitor', type: 'BP Monitor', status: 'connected', lastSync: '2 hours ago' },
    { name: 'Fitbit Charge 6', type: 'Fitness Tracker', status: 'disconnected', lastSync: '2 days ago' }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Health Tracking</h1>
            <p className="text-gray-600">Monitor your vitals and sync with wearable devices</p>
          </div>
          <button
            onClick={() => setShowAddVital(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Log Vital
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl mb-1">72</div>
            <div className="text-sm text-gray-600 mb-2">Heart Rate</div>
            <div className="text-xs text-gray-500">Last updated: 5 min ago</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl mb-1">127/81</div>
            <div className="text-sm text-gray-600 mb-2">Blood Pressure</div>
            <div className="text-xs text-gray-500">Last updated: 2 hours ago</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl mb-1">100</div>
            <div className="text-sm text-gray-600 mb-2">Glucose (mg/dL)</div>
            <div className="text-xs text-gray-500">Last updated: 3 hours ago</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600 rotate-180" />
            </div>
            <div className="text-3xl mb-1">163.2</div>
            <div className="text-sm text-gray-600 mb-2">Weight (lbs)</div>
            <div className="text-xs text-gray-500">Last updated</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl mb-6">Blood Pressure Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[60, 160]} />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl mb-6">Blood Glucose Levels</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={glucoseData}>
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[70, 140]} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#colorGlucose)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl mb-6">Weight Progress</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[160, 166]} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">Starting Weight</div>
              <div className="text-xl">165 lbs</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <div className="text-sm text-gray-600">Current Weight</div>
              <div className="text-xl text-green-600">163.2 lbs</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <div className="text-sm text-gray-600">Goal Weight</div>
              <div className="text-xl">160 lbs</div>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-center">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-xl text-green-600">-1.8 lbs</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl">Connected Devices</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {connectedDevices.map((device, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    {device.type.includes('Watch') || device.type.includes('Fitness') ? (
                      <Watch className="w-6 h-6 text-gray-600" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="mb-1">{device.name}</h3>
                    <p className="text-sm text-gray-600">{device.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-sm mb-1 ${device.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {device.status === 'connected' ? 'Connected' : 'Disconnected'}
                    </div>
                    <div className="text-xs text-gray-500">Last sync: {device.lastSync}</div>
                  </div>
                  {device.status === 'connected' ? (
                    <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      Sync Now
                    </button>
                  ) : (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Reconnect
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="p-6">
              <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                + Add New Device
              </button>
            </div>
          </div>
        </div>

        {showAddVital && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl mb-6">Log Vital Signs</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm mb-2">Blood Pressure</label>
                  <div className="flex gap-3">
                    <input type="number" placeholder="Systolic" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="py-2">/</span>
                    <input type="number" placeholder="Diastolic" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2">Blood Glucose (mg/dL)</label>
                  <input type="number" placeholder="e.g., 100" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Weight (lbs)</label>
                  <input type="number" placeholder="e.g., 163.2" step="0.1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm mb-2">Heart Rate (bpm)</label>
                  <input type="number" placeholder="e.g., 72" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddVital(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddVital(false)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




