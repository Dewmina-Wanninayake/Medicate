import { Pill, FlaskConical, MapPin, Clock, CheckCircle, Truck, Calendar, Home } from 'lucide-react';
import { useState } from 'react';

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  doctor: string;
  pharmacy: string;
  status: 'pending' | 'ready' | 'picked-up' | 'delivered';
  prescribedDate: string;
  refills: number;
}

interface LabTest {
  id: string;
  testName: string;
  orderedBy: string;
  status: 'pending' | 'scheduled' | 'sample-collected' | 'results-ready';
  orderedDate: string;
  scheduledDate?: string;
  location: string;
  homeCollection: boolean;
}

export function PharmacyLabs() {
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'labs'>('prescriptions');
  const [showSchedule, setShowSchedule] = useState(false);

  const prescriptions: Prescription[] = [
    {
      id: '1',
      medication: 'Metformin',
      dosage: '500mg - Twice daily',
      doctor: 'Dr. Emily Chen',
      pharmacy: 'CVS Pharmacy - Main St',
      status: 'ready',
      prescribedDate: '2026-04-10',
      refills: 2
    },
    {
      id: '2',
      medication: 'Lisinopril',
      dosage: '10mg - Once daily',
      doctor: 'Dr. Emily Chen',
      pharmacy: 'CVS Pharmacy - Main St',
      status: 'delivered',
      prescribedDate: '2026-04-08',
      refills: 3
    },
    {
      id: '3',
      medication: 'Atorvastatin',
      dosage: '20mg - Once daily at bedtime',
      doctor: 'Dr. Sarah Patel',
      pharmacy: 'Walgreens - Oak Ave',
      status: 'pending',
      prescribedDate: '2026-04-13',
      refills: 1
    }
  ];

  const labTests: LabTest[] = [
    {
      id: '1',
      testName: 'Complete Blood Count (CBC)',
      orderedBy: 'Dr. Emily Chen',
      status: 'results-ready',
      orderedDate: '2026-04-05',
      location: 'Quest Diagnostics - Downtown',
      homeCollection: false
    },
    {
      id: '2',
      testName: 'Lipid Panel',
      orderedBy: 'Dr. Sarah Patel',
      status: 'sample-collected',
      orderedDate: '2026-04-10',
      scheduledDate: '2026-04-12',
      location: 'LabCorp - Home Collection',
      homeCollection: true
    },
    {
      id: '3',
      testName: 'HbA1c Test',
      orderedBy: 'Dr. Emily Chen',
      status: 'scheduled',
      orderedDate: '2026-04-11',
      scheduledDate: '2026-04-15',
      location: 'Quest Diagnostics - Downtown',
      homeCollection: false
    },
    {
      id: '4',
      testName: 'Vitamin D Level',
      orderedBy: 'Dr. Sarah Patel',
      status: 'pending',
      orderedDate: '2026-04-13',
      location: 'Not scheduled',
      homeCollection: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'results-ready':
        return 'bg-green-100 text-green-700';
      case 'delivered':
      case 'sample-collected':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'scheduled':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Pharmacy & Labs</h1>
          <p className="text-gray-600">Track your prescriptions and lab tests</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'prescriptions'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Pill className="w-5 h-5" />
            Prescriptions ({prescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'labs'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FlaskConical className="w-5 h-5" />
            Lab Tests ({labTests.length})
          </button>
        </div>

        {activeTab === 'prescriptions' && (
          <div>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl mb-1">{prescriptions.filter(p => p.status === 'ready').length}</div>
                <div className="text-sm text-gray-600">Ready for Pickup</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl mb-1">{prescriptions.filter(p => p.status === 'delivered').length}</div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl mb-1">{prescriptions.filter(p => p.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
            </div>

            <div className="space-y-4">
              {prescriptions.map(prescription => (
                <div key={prescription.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Pill className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl">{prescription.medication}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(prescription.status)}`}>
                            {getStatusLabel(prescription.status)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{prescription.dosage}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Prescribed by {prescription.doctor}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {prescription.pharmacy}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(prescription.prescribedDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {prescription.refills} refills remaining
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {prescription.status === 'ready' && (
                        <>
                          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                            Request Delivery
                          </button>
                          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                            Get Directions
                          </button>
                        </>
                      )}
                      {prescription.status === 'pending' && (
                        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                          Track Status
                        </button>
                      )}
                      {prescription.status === 'delivered' && prescription.refills > 0 && (
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                          Request Refill
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'labs' && (
          <div>
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl mb-1">{labTests.filter(t => t.status === 'results-ready').length}</div>
                <div className="text-sm text-gray-600">Results Ready</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl mb-1">{labTests.filter(t => t.status === 'scheduled').length}</div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl mb-1">{labTests.filter(t => t.status === 'sample-collected').length}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl mb-1">{labTests.filter(t => t.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>

            <div className="space-y-4">
              {labTests.map(test => (
                <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <FlaskConical className="w-7 h-7 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl">{test.testName}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(test.status)}`}>
                            {getStatusLabel(test.status)}
                          </span>
                          {test.homeCollection && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1">
                              <Home className="w-3 h-3" />
                              Home Collection
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Ordered by {test.orderedBy}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Ordered: {new Date(test.orderedDate).toLocaleDateString()}
                          </div>
                          {test.scheduledDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Scheduled: {new Date(test.scheduledDate).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex items-center gap-2 col-span-3">
                            <MapPin className="w-4 h-4" />
                            {test.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {test.status === 'results-ready' && (
                        <>
                          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
                            View Results
                          </button>
                          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                            Download PDF
                          </button>
                        </>
                      )}
                      {test.status === 'pending' && (
                        <button
                          onClick={() => setShowSchedule(true)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Schedule Test
                        </button>
                      )}
                      {test.status === 'scheduled' && (
                        <>
                          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                            Reschedule
                          </button>
                          <button className="px-6 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap">
                            Cancel
                          </button>
                        </>
                      )}
                      {test.status === 'sample-collected' && (
                        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                          Track Status
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSchedule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-2xl mb-6">Schedule Lab Test</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm mb-2">Select Location</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Quest Diagnostics - Downtown</option>
                    <option>LabCorp - Main Street</option>
                    <option>Quest Diagnostics - Uptown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-2">Preferred Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Preferred Time</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>8:00 AM - 9:00 AM</option>
                    <option>9:00 AM - 10:00 AM</option>
                    <option>10:00 AM - 11:00 AM</option>
                    <option>11:00 AM - 12:00 PM</option>
                    <option>2:00 PM - 3:00 PM</option>
                    <option>3:00 PM - 4:00 PM</option>
                  </select>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm">Request home sample collection (+$30)</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSchedule(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSchedule(false)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
