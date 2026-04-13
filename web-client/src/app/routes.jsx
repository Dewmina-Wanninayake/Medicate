import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import AppointmentsPage from "./pages/AppointmentsPage";
import PatientRecordsPage from "./pages/PatientRecordsPage";
import TelemedicinePage from "./pages/TelemedicinePage";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import PaymentsPage from "./pages/PaymentsPage";
import SettingsPage from "./pages/SettingsPage";
import TelemedicineHubPage from "./pages/TelemedicineHubPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/telemedicine/:appointmentId",
    Component: TelemedicinePage,
  },
  {
    Component: MainLayout,
    children: [
      {
        path: "/",
        Component: LandingPage,
      },
      {
        path: "dashboard",
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
      {
        path: "telemedicine",
        Component: TelemedicineHubPage,
      },
      {
        path: "payments",
        Component: PaymentsPage,
      },
      {
        path: "settings",
        Component: SettingsPage,
      },
    ],
  },
  {
    path: "*",
    Component: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4">404 - Page Not Found</h1>
          <a href="/" className="text-primary hover:underline">
            Return Home
          </a>
        </div>
      </div>
    ),
  },
]);
