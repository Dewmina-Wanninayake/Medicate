import { DollarSign, TrendingUp, Users, Calendar, Download, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AdminAnalytics() {
  const revenueData = [
    { month: 'Oct', revenue: 45000, payouts: 38000 },
    { month: 'Nov', revenue: 52000, payouts: 44000 },
    { month: 'Dec', revenue: 58000, payouts: 49000 },
    { month: 'Jan', revenue: 61000, payouts: 52000 },
    { month: 'Feb', revenue: 68000, payouts: 58000 },
    { month: 'Mar', revenue: 75000, payouts: 64000 },
    { month: 'Apr', revenue: 82000, payouts: 70000 }
  ];

  const specialtyDistribution = [
    { name: 'Cardiology', value: 28, color: '#3b82f6' },
    { name: 'Dermatology', value: 22, color: '#8b5cf6' },
    { name: 'Endocrinology', value: 18, color: '#10b981' },
    { name: 'General Practice', value: 32, color: '#f59e0b' }
  ];

  const appointmentTrends = [
    { week: 'Week 1', total: 145, completed: 132, cancelled: 13 },
    { week: 'Week 2', total: 168, completed: 155, cancelled: 13 },
    { week: 'Week 3', total: 192, completed: 178, cancelled: 14 },
    { week: 'Week 4', total: 215, completed: 198, cancelled: 17 }
  ];

  const doctorPayouts = [
    { name: 'Dr. Emily Chen', amount: 12500, patients: 89, status: 'processed' },
    { name: 'Dr. Michael Rodriguez', amount: 10800, patients: 76, status: 'processed' },
    { name: 'Dr. Sarah Patel', amount: 14200, patients: 102, status: 'pending' },
    { name: 'Dr. James Wilson', amount: 9600, patients: 68, status: 'processed' },
    { name: 'Dr. Lisa Anderson', amount: 11300, patients: 81, status: 'pending' }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Analytics & Finance</h1>
            <p className="text-gray-600">Platform performance and revenue insights</p>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl mb-1">$82,450</div>
            <div className="text-sm text-gray-600 mb-2">Total Revenue (April)</div>
            <div className="text-xs text-green-600">+12.3% from last month</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl mb-1">720</div>
            <div className="text-sm text-gray-600 mb-2">Total Appointments</div>
            <div className="text-xs text-green-600">+8.5% from last month</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl mb-1">1,248</div>
            <div className="text-sm text-gray-600 mb-2">Active Patients</div>
            <div className="text-xs text-green-600">+15.2% from last month</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">4.82</div>
            <div className="text-sm text-gray-600 mb-2">Avg Satisfaction Score</div>
            <div className="text-xs text-gray-500">Out of 5.0</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl mb-6">Revenue & Payouts Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Platform Revenue" />
                <Line type="monotone" dataKey="payouts" stroke="#3b82f6" strokeWidth={2} name="Doctor Payouts" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl mb-6">Specialty Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={specialtyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {specialtyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl mb-6">Appointment Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appointmentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl">Doctor Payouts</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {doctorPayouts.map((payout, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="mb-1">{payout.name}</h3>
                    <p className="text-sm text-gray-600">{payout.patients} patients this month</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl mb-1">${payout.amount.toLocaleString()}</div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        payout.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payout.status === 'processed' ? 'Processed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl">Key Metrics</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Patient Satisfaction</span>
                  <span className="text-sm">96.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '96.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Appointment Completion Rate</span>
                  <span className="text-sm">92.1%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92.1%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">No-Show Rate</span>
                  <span className="text-sm">5.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '5.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Platform Fee Collection</span>
                  <span className="text-sm">98.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98.8%' }} />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm mb-4">Financial Summary (April 2026)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gross Revenue</span>
                    <span className="text-sm">$82,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Doctor Payouts</span>
                    <span className="text-sm text-red-600">-$70,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Processing Fees</span>
                    <span className="text-sm text-red-600">-$1,240</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <span className="text-sm">Net Revenue</span>
                    <span className="text-lg text-green-600">$11,210</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}






