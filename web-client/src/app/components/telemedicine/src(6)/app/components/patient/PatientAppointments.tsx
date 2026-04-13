import { Calendar, Clock, Video, X, DollarSign, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'video' | 'audio';
  status: 'upcoming' | 'completed' | 'cancelled';
  fee: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  avatar: string;
}

export function PatientAppointments() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const appointments: Appointment[] = [
    {
      id: '1',
      doctorName: 'Dr. Emily Chen',
      specialty: 'Cardiology',
      date: '2026-04-15',
      time: '10:00 AM',
      type: 'video',
      status: 'upcoming',
      fee: 150,
      paymentStatus: 'paid',
      avatar: 'EC'
    },
    {
      id: '2',
      doctorName: 'Dr. Sarah Patel',
      specialty: 'Endocrinology',
      date: '2026-04-18',
      time: '2:30 PM',
      type: 'video',
      status: 'upcoming',
      fee: 180,
      paymentStatus: 'pending',
      avatar: 'SP'
    },
    {
      id: '3',
      doctorName: 'Dr. Michael Rodriguez',
      specialty: 'Dermatology',
      date: '2026-04-05',
      time: '11:00 AM',
      type: 'video',
      status: 'completed',
      fee: 120,
      paymentStatus: 'paid',
      avatar: 'MR'
    },
    {
      id: '4',
      doctorName: 'Dr. James Wilson',
      specialty: 'General Practice',
      date: '2026-03-28',
      time: '9:00 AM',
      type: 'video',
      status: 'completed',
      fee: 100,
      paymentStatus: 'paid',
      avatar: 'JW'
    }
  ];

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed' || apt.status === 'cancelled');

  const handlePayment = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setShowPayment(true);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">My Appointments</h1>
          <p className="text-gray-600">View and manage your consultations</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">{upcomingAppointments.length}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">{pastAppointments.filter(a => a.status === 'completed').length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">${appointments.filter(a => a.paymentStatus === 'pending').reduce((sum, a) => sum + a.fee, 0)}</div>
            <div className="text-sm text-gray-600">Pending Payment</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl mb-1">4</div>
            <div className="text-sm text-gray-600">Total This Month</div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 rounded-lg transition-colors ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Past ({pastAppointments.length})
          </button>
        </div>

        <div className="space-y-4">
          {(activeTab === 'upcoming' ? upcomingAppointments : pastAppointments).map(apt => (
            <div key={apt.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl">
                    {apt.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl">{apt.doctorName}</h3>
                      {apt.paymentStatus === 'pending' && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                          Payment Pending
                        </span>
                      )}
                      {apt.status === 'cancelled' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{apt.specialty}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{apt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-400" />
                        <span>Video Call</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>${apt.fee}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {apt.status === 'upcoming' && apt.paymentStatus === 'pending' && (
                    <button
                      onClick={() => handlePayment(apt.id)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                  {apt.status === 'upcoming' && apt.paymentStatus === 'paid' && (
                    <>
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Join Call
                      </button>
                      <button className="px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        Reschedule
                      </button>
                      <button className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        Cancel
                      </button>
                    </>
                  )}
                  {apt.status === 'completed' && (
                    <>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        View Summary
                      </button>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Download Invoice
                      </button>
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Book Again
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl">Payment</h2>
                <button
                  onClick={() => setShowPayment(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span>$150.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Platform Fee</span>
                  <span>$10.00</span>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between">
                  <span>Total Amount</span>
                  <span className="text-xl">$160.00</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <CreditCard className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 mb-6">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-600">Save this card for future payments</span>
              </label>

              <button
                onClick={() => setShowPayment(false)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Pay $160.00
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
