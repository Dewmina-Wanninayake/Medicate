import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Bell, Calendar, CreditCard, MessageSquare, Info, CheckCircle, Search, X, Clock } from 'lucide-react';

const SAMPLE_NOTIFICATIONS = [
  {
    _id: '1',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Sarah Adams has been confirmed for tomorrow at 10:00 AM.',
    type: 'appointment',
    priority: 'high',
    status: 'unread',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'New Lab Report',
    message: 'Your Blood Test results are now available for review.',
    type: 'system',
    priority: 'medium',
    status: 'read',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: '3',
    title: 'Payment Successful',
    message: 'Transaction TX-9921-001 of $150.00 was successful.',
    type: 'payment',
    priority: 'low',
    status: 'read',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [searchTerm, setSearchTerm] = useState('');

  const getIcon = (type) => {
    switch(type) {
      case 'appointment': return Calendar;
      case 'payment': return CreditCard;
      case 'system': return Info;
      default: return Bell;
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Notifications</h1>
          <p className="text-muted-foreground mt-2 text-lg">Stay updated with your health and activity.</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllRead} className="rounded-full bg-primary hover:bg-accent h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 gap-3">
            <CheckCircle className="w-5 h-5" /> Mark All Read
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none shadow-md p-6 flex items-center gap-4">
          <Bell className="w-8 h-8 text-primary" />
          <div><p className="text-2xl font-bold">{notifications.length}</p><p className="text-sm text-muted-foreground">Total</p></div>
        </Card>
        <Card className="rounded-3xl border-none shadow-md p-6 flex items-center gap-4">
          <Clock className="w-8 h-8 text-yellow-500" />
          <div><p className="text-2xl font-bold">{unreadCount}</p><p className="text-sm text-muted-foreground">Unread</p></div>
        </Card>
        <Card className="rounded-3xl border-none shadow-md p-6 flex items-center gap-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div><p className="text-2xl font-bold">{notifications.length - unreadCount}</p><p className="text-sm text-muted-foreground">Read</p></div>
        </Card>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => {
          const Icon = getIcon(n.type);
          return (
            <Card key={n._id} className={`rounded-3xl border-none shadow-md transition-all hover:shadow-lg ${n.status === 'unread' ? 'bg-primary/5 border-l-4 border-primary' : 'bg-white'}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${n.status === 'unread' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{n.title}</h3>
                        <p className="text-muted-foreground mt-1">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      {n.status === 'unread' && (
                        <Badge className="bg-primary text-white rounded-full">New</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
