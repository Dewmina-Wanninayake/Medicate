import { useState } from 'react';
import { DoctorDashboard } from '../components/telemedicine/doctor/DoctorDashboard';
import { ConsultationView } from '../components/telemedicine/doctor/ConsultationView';
import { PatientWaitingRoom } from '../components/telemedicine/PatientWaitingRoom';
import { MessagingPanel } from '../components/telemedicine/doctor/MessagingPanel';
import { MonitoringDashboard } from '../components/telemedicine/doctor/MonitoringDashboard';
import { PrescriptionWorkflow } from '../components/telemedicine/doctor/PrescriptionWorkflow';
import { SchedulingCalendar } from '../components/telemedicine/doctor/SchedulingCalendar';
import { SecurityIndicator } from '../components/telemedicine/SecurityIndicator';
import { PatientProfile } from '../components/telemedicine/patient/PatientProfile';
import { DoctorSearch } from '../components/telemedicine/patient/DoctorSearch';
import { PatientAppointments } from '../components/telemedicine/patient/PatientAppointments';
import { HealthTracking } from '../components/telemedicine/patient/HealthTracking';
import { PharmacyLabs } from '../components/telemedicine/patient/PharmacyLabs';
import { DoctorManagement } from '../components/telemedicine/admin/DoctorManagement';
import { AdminAnalytics } from '../components/telemedicine/admin/AdminAnalytics';
import { ComplianceCMS } from '../components/telemedicine/admin/ComplianceCMS';
import { useTelemedicine } from '../context/TelemedicineContext';

export default function TelemedicineHubPage() {
  const {
    role,
    doctorView, setDoctorView,
    patientView, setPatientView,
    adminView,
  } = useTelemedicine();

  const [inCall, setInCall] = useState(false);
  const [activePatientId, setActivePatientId] = useState(null);

  const handleStartCall = (patientId) => {
    setActivePatientId(patientId);
    setInCall(true);
  };

  const handleEndCall = () => {
    setInCall(false);
    setActivePatientId(null);
    if (role === 'doctor') setDoctorView('dashboard');
    else setPatientView('appointments');
  };

  const handleNavigate = (view) => {
    if (role === 'doctor') setDoctorView(view);
    else if (role === 'patient') setPatientView(view);
    else setAdminView(view);
  };

  if (inCall && activePatientId) {
    return <ConsultationView patientId={activePatientId} onEndCall={handleEndCall} />;
  }

  if (role === 'patient' && patientView === 'waiting-room') {
    return <PatientWaitingRoom onJoinCall={handleStartCall} />;
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl overflow-hidden shadow-sm border border-border">
      {/* 
        The top navigation bar has been moved to the global Header.jsx 
        to maintain a cleaner layout as requested by the user.
      */}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-muted/20 relative">
        {role === 'doctor' && (
          <>
            {doctorView === 'dashboard' && (
              <DoctorDashboard onStartCall={handleStartCall} onNavigate={handleNavigate} />
            )}
            {doctorView === 'schedule' && <SchedulingCalendar />}
            {doctorView === 'messages' && <MessagingPanel />}
            {doctorView === 'monitoring' && <MonitoringDashboard />}
            {doctorView === 'prescriptions' && <PrescriptionWorkflow />}
          </>
        )}

        {role === 'patient' && (
          <>
            {patientView === 'profile' && <PatientProfile />}
            {patientView === 'find-doctor' && <DoctorSearch />}
            {patientView === 'appointments' && (
              <PatientAppointments
                onJoinCall={(id) => {
                  setActivePatientId(id);
                  setPatientView('waiting-room');
                }}
              />
            )}
            {patientView === 'health-tracking' && <HealthTracking />}
            {patientView === 'pharmacy-labs' && <PharmacyLabs />}
          </>
        )}

        {role === 'admin' && (
          <>
            {adminView === 'doctors' && <DoctorManagement />}
            {adminView === 'analytics' && <AdminAnalytics />}
            {adminView === 'compliance' && <ComplianceCMS />}
          </>
        )}

        <SecurityIndicator />
      </main>
    </div>
  );
}
