import { Star, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { mockDoctors } from '../../data/mockData';

export default function DoctorDiscovery({ onJoinQueue }) {
  // Enhancing mock data with real-time specific statuses
  const enhancedDoctors = mockDoctors.map((doc, index) => ({
    ...doc,
    status: index % 3 === 0 ? 'in-call' : index % 2 === 0 ? 'offline' : 'online',
    waitTime: index % 3 === 0 ? 15 : index % 2 !== 0 ? 5 : null,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Virtual Clinic Discovery</h2>
          <p className="text-muted-foreground text-sm">Join a live queue for immediate consultation.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {enhancedDoctors.map((doctor) => {
          const isOnline = doctor.status === 'online';
          const isInCall = doctor.status === 'in-call';
          
          return (
            <Card key={doctor.id} className="rounded-[24px] border border-border shadow-sm hover:shadow-md bg-white transition-all">
              <CardContent className="p-5">
                <div className="flex gap-4 mb-4 items-center">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100">
                    <img src={doctor.imageUrl} alt={doctor.name} className="object-cover w-full h-full" />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : isInCall ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground font-medium">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span>{doctor.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl mb-4 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : isInCall ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-semibold capitalize text-gray-700">
                      {isOnline ? 'Available Now' : isInCall ? 'In Consultation' : 'Offline'}
                    </span>
                  </div>
                  {doctor.waitTime && (
                    <Badge variant="outline" className="text-xs bg-white text-gray-600 border-gray-200 shadow-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Est. {doctor.waitTime}m
                    </Badge>
                  )}
                </div>

                <Button 
                  className={`w-full rounded-full font-medium tracking-wide ${isOnline || isInCall ? 'bg-primary hover:bg-accent' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                  disabled={!isOnline && !isInCall}
                  onClick={() => onJoinQueue(doctor)}
                >
                  {isInCall ? 'Join Queue' : isOnline ? 'Consult Now' : 'Currently Offline'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
