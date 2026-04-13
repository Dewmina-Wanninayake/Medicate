import { UserPlus, CheckCircle, XCircle, Clock, Search, Filter, FileText, Shield } from 'lucide-react';
import { useState } from 'react';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseState: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  joinedDate: string;
  patientsServed: number;
  rating: number;
  verificationStatus: 'verified' | 'pending' | 'rejected';
}

export function ProviderManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Emily Chen',
      specialty: 'Cardiology',
      email: 'emily.chen@hospital.com',
      phone: '+1 (555) 234-5678',
      licenseNumber: 'MD-12345-NY',
      licenseState: 'New York',
      status: 'active',
      joinedDate: '2025-01-15',
      patientsServed: 342,
      rating: 4.9,
      verificationStatus: 'verified'
    },
    {
      id: '2',
      name: 'Dr. Michael Rodriguez',
      specialty: 'Dermatology',
      email: 'michael.rodriguez@clinic.com',
      phone: '+1 (555) 345-6789',
      licenseNumber: 'MD-23456-CA',
      licenseState: 'California',
      status: 'active',
      joinedDate: '2025-03-20',
      patientsServed: 289,
      rating: 4.8,
      verificationStatus: 'verified'
    },
    {
      id: '3',
      name: 'Dr. Sarah Patel',
      specialty: 'Endocrinology',
      email: 'sarah.patel@medical.com',
      phone: '+1 (555) 456-7890',
      licenseNumber: 'MD-34567-IL',
      licenseState: 'Illinois',
      status: 'pending',
      joinedDate: '2026-04-10',
      patientsServed: 0,
      rating: 0,
      verificationStatus: 'pending'
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialty: 'General Practice',
      email: 'james.wilson@health.com',
      phone: '+1 (555) 567-8901',
      licenseNumber: 'MD-45678-MA',
      licenseState: 'Massachusetts',
      status: 'inactive',
      joinedDate: '2024-11-05',
      patientsServed: 521,
      rating: 4.7,
      verificationStatus: 'verified'
    }
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || provider.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: providers.length,
    active: providers.filter(p => p.status === 'active').length,
    pending: providers.filter(p => p.status === 'pending').length,
    inactive: providers.filter(p => p.status === 'inactive').length
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Provider Management</h1>
            <p className="text-gray-600">Manage healthcare provider onboarding and credentials</p>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Provider
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Providers</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Providers</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Verification</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">{stats.inactive}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, specialty, or email..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Provider</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Specialty</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">License</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Verification</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Patients</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Rating</th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProviders.map(provider => (
                  <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="mb-1">{provider.name}</div>
                        <div className="text-sm text-gray-600">{provider.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{provider.specialty}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="mb-1">{provider.licenseNumber}</div>
                        <div className="text-sm text-gray-600">{provider.licenseState}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        provider.status === 'active' ? 'bg-green-100 text-green-700' :
                        provider.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        provider.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${
                        provider.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                        provider.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {provider.verificationStatus === 'verified' && <Shield className="w-3 h-3" />}
                        {provider.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{provider.patientsServed}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-900">{provider.rating > 0 ? provider.rating.toFixed(1) : 'N/A'}</span>
                        {provider.rating > 0 && (
                          <svg className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProvider(provider)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          View
                        </button>
                        {provider.status === 'pending' && (
                          <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                            Approve
                          </button>
                        )}
                        {provider.status === 'active' && (
                          <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors">
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedProvider && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Provider Details</h2>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                      <div className="text-gray-900">{selectedProvider.name}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Specialty</label>
                      <div className="text-gray-900">{selectedProvider.specialty}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <div className="text-gray-900">{selectedProvider.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Phone</label>
                      <div className="text-gray-900">{selectedProvider.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg mb-4">Credentials</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">License Number</label>
                      <div className="text-gray-900">{selectedProvider.licenseNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">License State</label>
                      <div className="text-gray-900">{selectedProvider.licenseState}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Joined Date</label>
                      <div className="text-gray-900">{new Date(selectedProvider.joinedDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Verification Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 ${
                        selectedProvider.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedProvider.verificationStatus === 'verified' && <Shield className="w-3 h-3" />}
                        {selectedProvider.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <div className="text-2xl mb-1">{selectedProvider.patientsServed}</div>
                      <div className="text-sm text-gray-600">Patients Served</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <div className="text-2xl mb-1">{selectedProvider.rating > 0 ? selectedProvider.rating.toFixed(1) : 'N/A'}</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <div className="text-2xl mb-1">94%</div>
                      <div className="text-sm text-gray-600">Satisfaction</div>
                    </div>
                  </div>
                </div>

                {selectedProvider.status === 'pending' && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg mb-4">Pending Actions</h3>
                    <div className="flex gap-3">
                      <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Approve & Activate
                      </button>
                      <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Reject Application
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
