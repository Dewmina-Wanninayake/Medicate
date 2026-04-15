import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Info, History, FileText, ChevronRight, Users } from 'lucide-react';
import { mockAllPatients } from '../../data/mockDashboardData';

export default function DoctorPatients() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = mockAllPatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
      {/* Patient List */}
      <div className="lg:col-span-1 space-y-4 flex flex-col">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search patients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-full pl-10 bg-card/50"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filteredPatients.map(patient => (
            <div 
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedPatient?.id === patient.id 
                  ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                  : 'bg-card hover:bg-muted border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  selectedPatient?.id === patient.id ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'
                }`}>
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{patient.name}</div>
                  <div className={`text-xs ${selectedPatient?.id === patient.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    Last visit: {patient.lastVisit}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50" />
            </div>
          ))}
        </div>
      </div>

      {/* Details View */}
      <div className="lg:col-span-2">
        {selectedPatient ? (
          <Card className="h-full rounded-[40px] border-none shadow-xl overflow-y-auto">
            <CardHeader className="p-8 border-b border-border/50">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{selectedPatient.name}</h2>
                    <p className="text-muted-foreground">{selectedPatient.age} years • {selectedPatient.condition}</p>
                  </div>
                </div>
                <Button className="rounded-full px-8">Full Profile</Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Medical History
                </h3>
                <div className="space-y-3">
                  {selectedPatient.history.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex gap-4 items-start">
                      <div className="mt-1"><Info className="w-4 h-4 text-primary" /></div>
                      <p className="text-sm text-foreground/80">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Recent Documents
                </h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl border border-dashed border-primary/30 flex items-center justify-center text-sm text-muted-foreground hover:bg-primary/5 transition-colors cursor-pointer">
                     Click to view lab results
                   </div>
                   <div className="p-4 rounded-2xl border border-dashed border-primary/30 flex items-center justify-center text-sm text-muted-foreground hover:bg-primary/5 transition-colors cursor-pointer">
                     Click to view prescription history
                   </div>
                </div>
              </section>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/10 rounded-[40px] border border-dashed border-border">
            <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold opacity-50">Select a patient to view their medical history</h3>
          </div>
        )}
      </div>
    </div>
  );
}
