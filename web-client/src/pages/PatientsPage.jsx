import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Users, Search, Filter, MessageSquare, Video, FileText, ChevronRight, MoreVertical } from 'lucide-react';

const SAMPLE_PATIENTS = [
  { id: '1', name: 'Alice Walker', age: 28, gender: 'Female', lastVisit: '2026-04-10', status: 'Active' },
  { id: '2', name: 'Bob Thompson', age: 45, gender: 'Male', lastVisit: '2026-03-22', status: 'Inactive' },
  { id: '3', name: 'Charlie Davis', age: 34, gender: 'Male', lastVisit: '2026-04-15', status: 'Active' },
];

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-primary">Patient Directory</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage and view your patient clinical history.</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-accent h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 gap-3">
          <Plus className="w-5 h-5" /> Add New Patient
        </Button>
      </div>

      <Card className="rounded-[40px] border-none shadow-lg overflow-hidden bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="p-8 border-b border-border/50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 rounded-full border-none bg-white shadow-sm text-lg" 
              />
            </div>
            <Button variant="outline" className="h-14 rounded-full px-6 gap-2 border-none bg-white shadow-sm">
              <Filter className="w-5 h-5" /> Filters
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 text-left text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="py-6 px-8">Patient</th>
                  <th className="py-6 px-8">Details</th>
                  <th className="py-6 px-8">Last Visit</th>
                  <th className="py-6 px-8">Status</th>
                  <th className="py-6 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {SAMPLE_PATIENTS.map((p) => (
                  <tr key={p.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-lg">{p.name}</div>
                          <div className="text-sm text-muted-foreground">ID: #{p.id.padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="text-sm">
                        <div className="font-bold">{p.age} years</div>
                        <div className="text-muted-foreground">{p.gender}</div>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-sm font-bold">
                      {p.lastVisit}
                    </td>
                    <td className="py-6 px-8">
                      <Badge className={`rounded-full px-4 py-1 border ${p.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary">
                          <MessageSquare className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary">
                          <FileText className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full h-10 px-4 font-bold border-primary/20 text-primary hover:bg-primary hover:text-white">
                          View Profile
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Plus({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>;
}
