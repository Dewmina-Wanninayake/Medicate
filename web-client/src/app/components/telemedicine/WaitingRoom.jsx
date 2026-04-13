import { useState, useEffect } from 'react';
import { Camera, Mic, Wifi, Video, AlertCircle, FilePlus, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

export default function WaitingRoom({ doctor, position, onLeave, simulateProgress }) {
  const [hardwareStatus, setHardwareStatus] = useState({ camera: false, mic: false, network: false });
  const [symptoms, setSymptoms] = useState('');

  // Simulate hardware checks via Agora pre-tests
  useEffect(() => {
    let timeoutId;
    const runChecks = async () => {
      timeoutId = setTimeout(() => setHardwareStatus(prev => ({ ...prev, network: true })), 1000);
      timeoutId = setTimeout(() => setHardwareStatus(prev => ({ ...prev, mic: true })), 2000);
      timeoutId = setTimeout(() => setHardwareStatus(prev => ({ ...prev, camera: true })), 3500);
    };
    runChecks();
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in slide-in-from-right-16 duration-500 fade-in">
      {/* Left 70%: Queue Tracker & Hardware test */}
      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Button variant="ghost" size="icon" onClick={onLeave} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Virtual Waiting Room</h2>
        </div>

        <Card className="flex-1 rounded-[32px] border-none shadow-xl bg-gradient-to-br from-indigo-900 to-slate-900 overflow-hidden relative border border-gray-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
          
          <CardContent className="h-full flex flex-col items-center justify-center relative z-10 text-white p-8">
            <h3 className="text-xl text-gray-300 font-medium mb-8 text-center max-w-md">
              You are securely queued. Please keep this window open. Dr. {doctor.name.split(' ')[1]} is currently wrapping up another consultation.
            </h3>
            
            {/* The Progress Tracker Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center group mb-10">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-gray-700 w-full opacity-50" strokeWidth="4"></circle>
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-green-400 stroke-current transition-all duration-1000 ease-out" 
                  strokeWidth="4" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - ((3 - position) / 3 * 283)}
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-1">Position in Line</span>
                <span className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">{position}</span>
              </div>
            </div>

            <Button onClick={simulateProgress} variant="outline" className="border-gray-700 text-gray-300 hover:text-white rounded-full bg-slate-800/50 backdrop-blur">
              [Debug] Simulate Queue Move
            </Button>
          </CardContent>
        </Card>

        {/* System Pre-Check Widget */}
        <Card className="rounded-[24px] border border-border shadow-sm">
          <CardContent className="p-5 flex justify-between items-center sm:flex-row flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">System Pre-Check</h4>
                <p className="text-xs text-muted-foreground">Agora Native SDK tests</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                {hardwareStatus.network ? <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div> : <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                <span className={`text-sm font-medium ${hardwareStatus.network ? 'text-gray-700' : 'text-gray-400'}`}>Network</span>
              </div>
              <div className="flex items-center gap-2">
                {hardwareStatus.mic ? <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div> : <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                <span className={`text-sm font-medium ${hardwareStatus.mic ? 'text-gray-700' : 'text-gray-400'}`}>Microphone</span>
              </div>
              <div className="flex items-center gap-2">
                {hardwareStatus.camera ? <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div> : <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                <span className={`text-sm font-medium ${hardwareStatus.camera ? 'text-gray-700' : 'text-gray-400'}`}>Camera</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right 30%: Triage Module Sidebar */}
      <aside className="lg:w-[30%] w-full flex flex-col space-y-6">
        <Card className="rounded-[24px] border border-border shadow-sm flex-1 bg-white flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Pre-Call Triage
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">Update your records while you wait. These notes will instantly appear on the doctor's screen upon connection.</p>
          </div>
          <CardContent className="p-6 flex flex-col flex-1 gap-6">
             <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Update Symptoms</label>
                <Textarea 
                  className="flex-1 resize-none rounded-[16px] bg-gray-50 border-gray-200 text-sm p-4 focus-visible:ring-primary shadow-inner"
                  placeholder="E.g., Fever started two days ago and is getting worse..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
             </div>
             <div>
                <Button variant="outline" className="w-full rounded-2xl border-dashed border-2 py-8 text-muted-foreground font-medium bg-gray-50 hover:bg-gray-100 flex flex-col gap-2 relative group">
                  <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <FilePlus className="w-5 h-5 text-primary" />
                  </div>
                  <span>Add Attachments (Lab Results)</span>
                </Button>
             </div>
             <Button className="w-full rounded-full shadow-md py-6 text-sm bg-gray-900 hover:bg-black text-white">
               Save Updates Securely
             </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
