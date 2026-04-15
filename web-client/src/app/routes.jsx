import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import AppointmentsPage from "./pages/AppointmentsPage";
import PatientRecordsPage from "./pages/PatientRecordsPage";
import TelemedicinePage from "./pages/TelemedicinePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import DashboardLayout from "./layouts/DashboardLayout";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";

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
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: DoctorDashboard,
      },
      {
        path: "appointments",
        Component: AppointmentsPage,
      },
      {
        path: "patients",
        Component: PatientRecordsPage,
      },
    ],
  },
  {
    path: "*",
    Component: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4">404 - Page Not Found</h1>
          <a href="/" className="text-primary hover:underline">Return Home</a>
        </div>
      </div>
    ),
  },
]);