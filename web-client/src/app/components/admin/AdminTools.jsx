import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  Settings, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Activity,
  Server
} from 'lucide-react';
import { mockDoctors, mockSystemOversight } from '../../data/mockDashboardData';

export default function AdminTools() {
  const [activeSubTab, setActiveSubTab] = useState('users');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub-tab Navigation */}
      <div className="flex gap-2 bg-muted/30 p-1.5 rounded-full w-fit">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'doctors', label: 'Doctor Approvals', icon: Stethoscope },
          { id: 'appointments', label: 'Oversight', icon: Calendar },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          { id: 'settings', label: 'System', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              activeSubTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid gap-6">
        {activeSubTab === 'users' && (
          <Card className="rounded-[40px] border-none shadow-lg">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-3xl border border-border/50">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">U{i}</div>
                        <div>
                          <div className="font-bold">Test User {i}</div>
                          <div className="text-xs text-muted-foreground">user{i}@example.com</div>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="rounded-full">Edit</Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-destructive">Delete</Button>
                     </div>
                   </div>
                 ))}
                 <Button className="w-full rounded-full border-dashed border-2 py-8 bg-transparent text-muted-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all">
                    + Add New User
                 </Button>
               </div>
            </CardContent>
          </Card>
        )}

        {activeSubTab === 'doctors' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold px-2">Pending Doctor Verifications</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {mockDoctors.filter(d => !d.verified).map(doctor => (
                <Card key={doctor.id} className="rounded-[32px] border-none shadow-md overflow-hidden group">
                  <div className="h-2 bg-yellow-400" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-xl font-bold">{doctor.name.charAt(4)}</div>
                        <div>
                          <h4 className="font-bold text-lg">{doctor.name}</h4>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1 rounded-full bg-primary hover:bg-accent gap-2">
                         <CheckCircle className="w-4 h-4" /> Approve
                      </Button>
                      <Button variant="outline" className="flex-1 rounded-full border-destructive/20 text-destructive hover:bg-destructive/5 gap-2">
                         <XCircle className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'appointments' && (
           <Card className="rounded-[40px] border-none shadow-lg">
             <CardHeader>
               <CardTitle>System Appointments Oversight</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-3xl">
                   <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                   <p className="text-lg">System-wide calendar view loading...</p>
                   <p className="text-sm">Oversight for 124 pending sessions enabled.</p>
                </div>
             </CardContent>
           </Card>
        )}

        {activeSubTab === 'reports' && (
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-[40px] border-none shadow-lg bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockSystemOversight.recentPayments.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50">
                    <div>
                      <div className="font-bold text-sm">{p.user}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{p.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{p.amount}</div>
                      <Badge variant="outline" className="text-[10px] rounded-full">{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[40px] border-none shadow-lg">
               <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Service Usage</CardTitle></CardHeader>
               <CardContent className="flex items-center justify-center p-8">
                  <div className="w-48 h-48 rounded-full border-[12px] border-primary/10 border-t-primary flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">78%</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Efficiency</span>
                  </div>
               </CardContent>
            </Card>
          </div>
        )}

        {activeSubTab === 'settings' && (
           <div className="grid md:grid-cols-3 gap-6 text-center">
              {[
                { title: "Authentication", icon: AlertCircle, status: "Active" },
                { title: "Notification Router", icon: Server, status: "Healthy" },
                { title: "Video API Service", icon: Activity, status: "Healthy" },
              ].map(s => (
                <Card key={s.title} className="rounded-[32px] border-none shadow-md p-8 hover:scale-105 transition-all">
                  <s.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                  <h4 className="font-bold mb-1">{s.title}</h4>
                  <Badge className="rounded-full bg-green-100 text-green-700 hover:bg-green-100">{s.status}</Badge>
                </Card>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}
