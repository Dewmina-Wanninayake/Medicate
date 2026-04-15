import { useEffect, useState } from 'react';
import AgoraUIKit from 'agora-react-uikit';
import { Badge } from '../ui/badge';
import { UserCircle, Activity } from 'lucide-react';

export default function CallCanvas({ doctor, agoraCredentials, onJoinSuccess, onEndCall }) {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    // We keep a small delay to allow the "Initializing..." overlay to show 
    // and for the Agora UIKit to mount and start its internal connection.
    const bootstrapEngine = setTimeout(() => {
      setEngineReady(true);
      if (onJoinSuccess) onJoinSuccess();
    }, 1500); // reduced from 2500 for better responsiveness

    return () => clearTimeout(bootstrapEngine);
  }, [onJoinSuccess]);

  if (!agoraCredentials) return null;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-gray-950 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 rounded-xl lg:rounded-none">
      
      {/* 2. Full Screen Agora Video Canvas */}
      <div className="flex-1 relative z-10 w-full h-full flex flex-col">
         {/* Floating Control Bar Overlay Info */}
         <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between tracking-wide bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <span className="text-white font-medium flex items-center gap-2 drop-shadow-md">
               <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border border-white"></span>
               Encrypted Live Session
            </span>
            <span className="text-gray-300 font-mono text-sm shadow-black">Channel: {agoraCredentials.channel}</span>
         </div>

         <div className="w-full h-full relative" style={{opacity: engineReady ? 1 : 0}}>
           {/* AgoraUIKit completely manages floating control bar (Mute, Camera, Leave) natively */}
           <AgoraUIKit 
              rtcProps={{
                appId: agoraCredentials.appId || 'dummyAppIdForMock',
                channel: agoraCredentials.channel || 'demoChannel',
                token: agoraCredentials.token || null,
                layout: 1, 
              }}
              callbacks={{
                EndCall: onEndCall
              }}
              styleProps={{
                localBtnContainer: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '24px', padding: '10px 20px', gap: '20px', bottom: '30px' },
              }}
           />
         </div>
      </div>

      {/* 3. Member Context Overlay (Slide-out panel 30%) */}
      <aside className="lg:w-[30%] w-[90%] mx-auto lg:mx-0 absolute lg:relative top-[20%] lg:top-0 right-4 lg:right-0 h-[60%] lg:h-full bg-white z-30 lg:border-l border-gray-100 flex flex-col rounded-3xl lg:rounded-none shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.4)] overflow-hidden">
         <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white text-black">
           <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
              <UserCircle className="w-6 h-6 text-primary" /> Member Context Map
           </h3>
           <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">ID: #M-84920</Badge>
         </div>
         
         <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white">
            <div>
               <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">Demographics</label>
               <div className="mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm space-y-2 font-medium">
                  <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-gray-900">Jane Doe</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Age</span><span className="text-gray-900">32 Yrs</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Priority</span><span className="text-amber-600 font-bold">Standard</span></div>
               </div>
            </div>

            <div>
               <label className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-3 flex items-center gap-1">
                 <Activity className="w-3.5 h-3.5" /> Clinical Triage Notes
               </label>
               <div className="text-sm text-indigo-900 leading-relaxed bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-inner">
                 Submitted asynchronously from waiting room: "Fever started two days ago and is getting progressively worse. Highest temp recorded: 102.4F." Requesting consultation regarding immediate intervention and antibiotics request.
               </div>
            </div>
         </div>
      </aside>
    </div>
  );
}

