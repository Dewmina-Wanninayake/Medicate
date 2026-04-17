import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "./pages/LandingPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import AppointmentsPage from "./pages/AppointmentsPage";
import PatientRecordsPage from "./pages/PatientRecordsPage";
import TelemedicinePage from "./pages/TelemedicinePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import MainLayout from "./layouts/MainLayout";
import PaymentsPage from "./pages/PaymentsPage";
import SettingsPage from "./pages/SettingsPage";
import TelemedicineHubPage from "./pages/TelemedicineHubPage";
import DashboardRouter from "./pages/DashboardRouter";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import ReportsPage from "./pages/ReportsPage";

// Doctor Pages
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorMessages from "./pages/doctor/DoctorMessages";
import DoctorProfile from "./pages/doctor/DoctorProfile";

// Patient Pages
import MyAppointmentsPage from "./pages/patient/MyAppointmentsPage";
import MyMedicalRecordsPage from "./pages/patient/MyMedicalRecordsPage";
import MyPrescriptionsPage from "./pages/patient/MyPrescriptionsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <RoleRoute roles={['admin']}>
        <AdminDashboard />
      </RoleRoute>
    ),
  },
  {
    path: "/telemedicine/:appointmentId",
    Component: TelemedicinePage,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        Component: DashboardRouter,
      },
      // ── Shared / Legacy routes ──────────────────────────────────
      {
        path: "appointments",
        Component: AppointmentsPage,
      },
      {
        path: "patients",
        Component: PatientRecordsPage,
      },
      {
        path: "telemedicine",
        Component: TelemedicineHubPage,
      },
      {
        path: "payments",
        Component: PaymentsPage,
      },
      {
        path: "reports",
        Component: ReportsPage,
      },
      {
        path: "settings",
        Component: SettingsPage,
      },
      // ── Patient-specific routes ─────────────────────────────────
      {
        path: "my-appointments",
        Component: MyAppointmentsPage,
      },
      {
        path: "records",
        Component: MyMedicalRecordsPage,
      },
      {
        path: "prescriptions",
        Component: MyPrescriptionsPage,
      },
      // ── Doctor routes ───────────────────────────────────────────
      {
        path: "doctor/appointments",
        Component: DoctorAppointments,
      },
      {
        path: "doctor/patients",
        Component: DoctorPatients,
      },
      {
        path: "doctor/schedule",
        Component: DoctorSchedule,
      },
      {
        path: "doctor/messages",
        Component: DoctorMessages,
      },
      {
        path: "doctor/profile",
        Component: DoctorProfile,
      },
    ],
  },
  {
    path: "*",
    Component: () => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black text-primary">404</h1>
          <p className="text-2xl font-bold text-muted-foreground">Page Not Found</p>
          <a href="/dashboard" className="inline-block mt-4 px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-accent transition-colors">
            Return to Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);