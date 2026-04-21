import { Card, CardContent } from '../components/ui/card';
import { Settings, FileText, Pill, DollarSign, FolderOpen, Calendar, Users, Video, Clock, Home, Bell } from 'lucide-react';
import { useLocation } from 'react-router';

export default function PlaceholderPage() {
  const location = useLocation();
  const path = location.pathname.replace('/', '');
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  const getIcon = () => {
    switch (path) {
      case 'records': return FolderOpen;
      case 'prescriptions': return Pill;
      case 'reports': return FileText;
      case 'payments': return DollarSign;
      case 'settings': return Settings;
      case 'appointments': return Calendar;
      case 'patients': return Users;
      case 'telemedicine': return Video;
      case 'schedule': return Clock;
      case 'messages': return Bell;
      case 'profile': return Settings;
      default: return FileText;
    }
  };

  const Icon = getIcon();

  return (
    <div className="h-full flex items-center justify-center p-8">
      <Card className="w-full max-w-md shadow-lg border-none rounded-[32px] bg-gradient-to-br from-card to-muted/30">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">
            This module is part of the customer experience flow but currently has no backend implementation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
