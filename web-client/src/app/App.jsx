import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { TelemedicineProvider } from './context/TelemedicineContext';

export default function App() {
  return (
    <AuthProvider>
      <TelemedicineProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TelemedicineProvider>
    </AuthProvider>
  );
}