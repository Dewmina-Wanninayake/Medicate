import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  duration: number;
  type: string;
  status: 'confirmed' | 'pending' | 'completed';
}

export function SchedulingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 13));
  const [selectedDate, setSelectedDate] = useState(13);
  const [view, setView] = useState<'week' | 'day'>('week');

  const appointments: Record<number, Appointment[]> = {
    13: [
      { id: '1', patientName: 'Sarah Johnson', time: '10:00 AM', duration: 15, type: 'Follow-up', status: 'confirmed' },
      { id: '2', patientName: 'Michael Chen', time: '10:30 AM', duration: 30, type: 'Initial', status: 'confirmed' },
      { id: '3', patientName: 'Emma Davis', time: '11:00 AM', duration: 15, type: 'Prescription', status: 'confirmed' },
      { id: '4', patientName: 'James Wilson', time: '11:30 AM', duration: 20, type: 'Review', status: 'confirmed' }
    ],
    14: [
      { id: '5', patientName: 'Lisa Anderson', time: '09:00 AM', duration: 30, type: 'Initial', status: 'confirmed' },
      { id: '6', patientName: 'David Brown', time: '10:00 AM', duration: 15, type: 'Follow-up', status: 'pending' }
    ],
    15: [
      { id: '7', patientName: 'Maria Garcia', time: '14:00 PM', duration: 20, type: 'Consultation', status: 'confirmed' }
    ]
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  });

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">Schedule</h1>
            <p className="text-gray-600">Manage appointments and availability</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-lg transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 rounded-lg transition-colors ${view === 'day' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                Day
              </button>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Appointment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">{monthName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => day && setSelectedDate(day)}
                  disabled={!day}
                  className={`aspect-square rounded-lg text-sm transition-colors relative ${
                    !day
                      ? 'invisible'
                      : day === selectedDate
                      ? 'bg-blue-600 text-white'
                      : day === 13
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {day}
                  {day && appointments[day] && appointments[day].length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {appointments[day].slice(0, 3).map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${day === selectedDate ? 'bg-white' : 'bg-blue-600'}`} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total this month</span>
                  <span>64 appointments</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Confirmed</span>
                  <span className="text-green-600">58</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="text-yellow-600">6</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl">
                  {currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {appointments[selectedDate]?.length || 0} appointments
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {appointments[selectedDate] && appointments[selectedDate].length > 0 ? (
                <div className="space-y-3">
                  {appointments[selectedDate].map(apt => (
                    <div
                      key={apt.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Time</div>
                            <div>{apt.time}</div>
                          </div>
                          <div className="w-px h-12 bg-gray-200" />
                          <div>
                            <h3 className="mb-1">{apt.patientName}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{apt.type}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-600">{apt.duration} min</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            apt.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : apt.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                          <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No appointments scheduled for this day</p>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Schedule Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl mb-4">Availability Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Working Hours</label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="time"
                    defaultValue="17:00"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Default Appointment Duration</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl mb-4">Reminder Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm">Send SMS reminders 24 hours before</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm">Send email reminders 2 hours before</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm">Auto-cancel if patient doesn't confirm</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
