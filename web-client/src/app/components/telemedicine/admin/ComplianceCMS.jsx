import { Shield, FileText, Bell, Search, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { useState } from 'react';





export function ComplianceCMS() {
  const [activeTab, setActiveTab] = useState('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const auditLogs = [
    {
      id: '1',
      timestamp: '2026-04-13 10:23:45',
      user: 'Dr. Emily Chen',
      userType: 'doctor',
      action: 'Accessed patient medical record',
      resource: 'Patient ID: 12345 - Sarah Johnson',
      ipAddress: '192.168.1.45',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2026-04-13 10:18:22',
      user: 'Sarah Johnson',
      userType: 'patient',
      action: 'Downloaded prescription',
      resource: 'Prescription ID-789',
      ipAddress: '192.168.1.89',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2026-04-13 09:56:11',
      user: 'Admin User',
      userType: 'admin',
      action: 'Modified system configuration',
      resource: 'Platform fees updated',
      ipAddress: '10.0.0.1',
      status: 'success'
    },
    {
      id: '4',
      timestamp: '2026-04-13 09:42:33',
      user: 'Dr. Michael Rodriguez',
      userType: 'doctor',
      action: 'Failed login attempt',
      resource: 'Authentication service',
      ipAddress: '192.168.1.56',
      status: 'failed'
    },
    {
      id: '5',
      timestamp: '2026-04-13 09:15:08',
      user: 'Emma Davis',
      userType: 'patient',
      action: 'Updated health profile',
      resource: 'Patient profile settings',
      ipAddress: '192.168.1.123',
      status: 'success'
    }
  ];

  const contentItems = [
    {
      id: '1',
      type: 'faq',
      title: 'How to schedule a telemedicine appointment?',
      status: 'published',
      lastUpdated: '2026-04-10',
      author: 'Admin Team'
    },
    {
      id: '2',
      type: 'blog',
      title: 'Managing Hypertension Through Telemedicine',
      status: 'published',
      lastUpdated: '2026-04-08',
      author: 'Medical Team'
    },
    {
      id: '3',
      type: 'notification',
      title: 'Platform maintenance scheduled for April 20',
      status: 'draft',
      lastUpdated: '2026-04-13',
      author: 'Admin Team'
    },
    {
      id: '4',
      type: 'blog',
      title: 'New Feature Patient Monitoring',
      status: 'draft',
      lastUpdated: '2026-04-12',
      author: 'Product Team'
    }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Compliance & CMS</h1>
          <p className="text-gray-600">Audit logs, content management, and system configuration</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-5 h-5" />
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('cms')}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'cms'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            Content Management
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'config'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            System Config
          </button>
        </div>

        {activeTab === 'audit' && (
          <div>
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl mb-1">1,248</div>
                <div className="text-sm text-gray-600">Total Events (24h)</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl mb-1">1,235</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl mb-1">13</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl mb-1">100%</div>
                <div className="text-sm text-gray-600">HIPAA Compliance</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search audit logs..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Users</option>
                  <option>Doctors</option>
                  <option>Patients</option>
                  <option>Admins</option>
                </select>
                <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Actions</option>
                  <option>Data Access</option>
                  <option>Data Modification</option>
                  <option>Failed Attempts</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm text-gray-600">Timestamp</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-600">User</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-600">Action</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-600">Resource</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-600">IP Address</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600">{log.timestamp}</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm">{log.user}</div>
                            <div className="text-xs text-gray-500">{log.userType}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{log.action}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{log.resource}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{log.ipAddress}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cms' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNotification(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Bell className="w-5 h-5" />
                  Send Notification
                </button>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Content
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {contentItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        item.type === 'faq' ? 'bg-blue-100' :
                        item.type === 'blog' ? 'bg-purple-100' :
                        'bg-orange-100'
                      }`}>
                        {item.type === 'faq' ? (
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : item.type === 'blog' ? (
                          <FileText className="w-6 h-6 text-purple-600" />
                        ) : (
                          <Bell className="w-6 h-6 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg">{item.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.status}
                          </span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {item.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>By {item.author}</span>
                          <span>•</span>
                          <span>Updated {new Date(item.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      {item.status === 'draft' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showNotification && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                  <h2 className="text-2xl mb-6">Send Platform Notification</h2>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm mb-2">Recipient Group</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Users</option>
                        <option>All Patients</option>
                        <option>All Doctors</option>
                        <option>Active Users Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Title</label>
                      <input
                        type="text"
                        placeholder="Notification title..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Message</label>
                      <textarea
                        placeholder="Notification message..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowNotification(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowNotification(false)}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Notification
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-6">Platform Fees & Charges</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">Platform Service Fee (%)</label>
                  <input
                    type="number"
                    defaultValue="15"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Payment Processing Fee (%)</label>
                  <input
                    type="number"
                    defaultValue="2.9"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Minimum Consultation Fee ($)</label>
                  <input
                    type="number"
                    defaultValue="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Maximum Consultation Fee ($)</label>
                  <input
                    type="number"
                    defaultValue="500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-6">Specialties Management</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Cardiology', 'Dermatology', 'Endocrinology', 'General Practice', 'Neurology', 'Pediatrics', 'Psychiatry', 'Orthopedics'].map(spec => (
                  <div key={spec} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-2">
                    {spec}
                    <button className="text-blue-700 hover:text-blue-900">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                + Add New Specialty
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl mb-6">Data Retention Policy</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Medical Records Retention (years)</label>
                  <input
                    type="number"
                    defaultValue="7"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Audit Log Retention (days)</label>
                  <input
                    type="number"
                    defaultValue="365"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Inactive Account Deletion (days)</label>
                  <input
                    type="number"
                    defaultValue="730"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





