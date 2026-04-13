import { User, Phone, Mail, MapPin, Upload, FileText, Download, Plus, AlertCircle } from 'lucide-react';
import { useState } from 'react';



export function PatientProfile() {
  const [activeTab, setActiveTab] = useState('profile');

  const [documents] = useState([
    { id: '1', name: 'Blood Test Results - March 2026', type: 'Lab Report', uploadDate: '2026-03-15', size: '2.3 MB' },
    { id: '2', name: 'MRI Scan - January 2026', type: 'Imaging', uploadDate: '2026-01-20', size: '15.8 MB' },
    { id: '3', name: 'Vaccination Records', type: 'Medical History', uploadDate: '2025-12-10', size: '1.1 MB' }
  ]);

  const patientInfo = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1992-05-15',
    gender: 'Female',
    bloodType: 'O+',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    insurance: {
      doctor: 'BlueCross BlueShield',
      policyNumber: 'BC-123456789',
      groupNumber: 'GRP-9876'
    }
  };

  const emergencyContacts = [
    { name: 'John Johnson', relation: 'Spouse', phone: '+1 (555) 123-4568' },
    { name: 'Mary Smith', relation: 'Mother', phone: '+1 (555) 987-6543' }
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and health records</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'vault'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Health Vault
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'emergency'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Emergency Contacts
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl">Personal Information</h2>
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="w-4 h-4 text-gray-400" />
                    {patientInfo.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Date of Birth</label>
                  <div className="text-gray-900">{new Date(patientInfo.dateOfBirth).toLocaleDateString()}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Email</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {patientInfo.email}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Phone</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {patientInfo.phone}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Gender</label>
                  <div className="text-gray-900">{patientInfo.gender}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Blood Type</label>
                  <div className="text-gray-900">{patientInfo.bloodType}</div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-2">Address</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {patientInfo.address}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg mb-4">Insurance Information</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Doctor</label>
                    <div className="text-gray-900">{patientInfo.insurance.doctor}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Policy Number</label>
                    <div className="text-gray-900">{patientInfo.insurance.policyNumber}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Group Number</label>
                    <div className="text-gray-900">{patientInfo.insurance.groupNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl">
                    SJ
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Change Photo
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Profile Completion
                </h3>
                <div className="w-full bg-white rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-xs text-gray-600">85% complete • Add emergency contacts</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl">Health Vault</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Document
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl mb-1">{documents.length}</div>
                  <div className="text-sm text-gray-600">Total Documents</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl mb-1">12.5 MB</div>
                  <div className="text-sm text-gray-600">Storage Used</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl mb-1">2</div>
                  <div className="text-sm text-gray-600">Shared with Doctors</div>
                </div>
              </div>

              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="mb-1">{doc.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <span>{doc.uploadDate}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                <p className="text-sm text-gray-500">Supported, JPG, PNG (Max 50MB)</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl">Emergency Contacts</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Contact
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="mb-1">{contact.name}</h3>
                          <p className="text-sm text-gray-600">{contact.relation}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {contact.phone}
                          </div>
                        </div>
                        <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="mb-1">Emergency contacts will be notified in case of medical emergencies.</p>
                    <p>We recommend adding at least 2 contacts with different phone numbers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




