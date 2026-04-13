import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { TelemedicineProvider } from './context/TelemedicineContext';

export default function App() {
  return (
    <TelemedicineProvider>
      <RouterProvider router={router} />
      <Toaster />
    </TelemedicineProvider>
  );
}
