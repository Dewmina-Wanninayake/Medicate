import { useState } from 'react';
import {
  Home,
  Calendar,
  MessageSquare,
  Activity,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Heart,
  Pill,
  Shield,
  BarChart3,
  Users
} from 'lucide-react';
import { ProviderDashboard } from './components/ProviderDashboard';
import { ConsultationView } from './components/ConsultationView';
import { PatientWaitingRoom } from './components/PatientWaitingRoom';
import { MessagingPanel } from './components/MessagingPanel';
import { MonitoringDashboard } from './components/MonitoringDashboard';
import { PrescriptionWorkflow } from './components/PrescriptionWorkflow';
import { SchedulingCalendar } from './components/SchedulingCalendar';
import { SecurityIndicator } from './components/SecurityIndicator';
import { PatientProfile } from './components/patient/PatientProfile';
import { DoctorSearch } from './components/patient/DoctorSearch';
import { PatientAppointments } from './components/patient/PatientAppointments';
import { HealthTracking } from './components/patient/HealthTracking';
import { PharmacyLabs } from './components/patient/PharmacyLabs';
import { ProviderManagement } from './components/admin/ProviderManagement';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { ComplianceCMS } from './components/admin/ComplianceCMS';

type ProviderView = 'dashboard' | 'schedule' | 'messages' | 'monitoring' | 'prescriptions';
type PatientView = 'profile' | 'find-doctor' | 'appointments' | 'health-tracking' | 'pharmacy-labs' | 'waiting-room';
type AdminView = 'providers' | 'analytics' | 'compliance';
type Role = 'provider' | 'patient' | 'admin';

export default function App() {
  const [role, setRole] = useState<Role>('provider');
  const [providerView, setProviderView] = useState<ProviderView>('dashboard');
  const [patientView, setPatientView] = useState<PatientView>('profile');
  const [adminView, setAdminView] = useState<AdminView>('providers');
  const [inCall, setInCall] = useState(false);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleStartCall = (patientId: string) => {
    setActivePatientId(patientId);
    setInCall(true);
  };

  const handleEndCall = () => {
    setInCall(false);
    setActivePatientId(null);
    setProviderView('dashboard');
  };

  const handleNavigate = (view: string) => {
    if (role === 'provider') {
      setProviderView(view as ProviderView);
    } else if (role === 'patient') {
      setPatientView(view as PatientView);
    } else {
      setAdminView(view as AdminView);
    }
  };

  const providerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText }
  ];

  const patientNavItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'find-doctor', label: 'Find Doctor', icon: Search },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'health-tracking', label: 'Health Tracking', icon: Heart },
    { id: 'pharmacy-labs', label: 'Pharmacy & Labs', icon: Pill }
  ];

  const adminNavItems = [
    { id: 'providers', label: 'Providers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'compliance', label: 'Compliance & CMS', icon: Shield }
  ];

  const getNavItems = () => {
    if (role === 'provider') return providerNavItems;
    if (role === 'patient') return patientNavItems;
    return adminNavItems;
  };

  const getCurrentView = () => {
    if (role === 'provider') return providerView;
    if (role === 'patient') return patientView;
    return adminView;
  };

  if (inCall && activePatientId && role === 'provider') {
    return <ConsultationView patientId={activePatientId} onEndCall={handleEndCall} />;
  }

  if (role === 'patient' && patientView === 'waiting-room') {
    return <PatientWaitingRoom />;
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl mb-1">TeleMed</h1>
              <p className="text-xs text-gray-600">Healthcare Platform</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {getNavItems().map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  getCurrentView() === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
            {sidebarOpen && <p className="text-xs text-gray-600 mb-2">Demo Mode</p>}
            <select
              value={role}
              onChange={(e) => {
                const newRole = e.target.value as Role;
                setRole(newRole);
                if (newRole === 'patient') {
                  setPatientView('profile');
                } else if (newRole === 'provider') {
                  setProviderView('dashboard');
                } else {
                  setAdminView('providers');
                }
              }}
              className={`w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${!sidebarOpen ? 'text-xs' : ''}`}
            >
              <option value="provider">{sidebarOpen ? 'Provider View' : 'Dr'}</option>
              <option value="patient">{sidebarOpen ? 'Patient View' : 'Pt'}</option>
              <option value="admin">{sidebarOpen ? 'Admin View' : 'Ad'}</option>
            </select>
          </div>

          {sidebarOpen ? (
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button className="w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="w-5 h-5 mx-auto" />
              </button>
              <button className="w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 mx-auto" />
              </button>
              <button className="w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 mx-auto" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {role === 'provider' && (
          <>
            {providerView === 'dashboard' && (
              <ProviderDashboard onStartCall={handleStartCall} onNavigate={handleNavigate} />
            )}
            {providerView === 'schedule' && <SchedulingCalendar />}
            {providerView === 'messages' && <MessagingPanel />}
            {providerView === 'monitoring' && <MonitoringDashboard />}
            {providerView === 'prescriptions' && <PrescriptionWorkflow />}
          </>
        )}

        {role === 'patient' && (
          <>
            {patientView === 'profile' && <PatientProfile />}
            {patientView === 'find-doctor' && <DoctorSearch />}
            {patientView === 'appointments' && <PatientAppointments />}
            {patientView === 'health-tracking' && <HealthTracking />}
            {patientView === 'pharmacy-labs' && <PharmacyLabs />}
          </>
        )}

        {role === 'admin' && (
          <>
            {adminView === 'providers' && <ProviderManagement />}
            {adminView === 'analytics' && <AdminAnalytics />}
            {adminView === 'compliance' && <ComplianceCMS />}
          </>
        )}

        <SecurityIndicator />
      </main>
    </div>
  );
}