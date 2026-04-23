// src/pages/FindDoctorsPage.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, MapPin, CheckCircle, ChevronRight, Stethoscope } from 'lucide-react';
import { doctorsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import DoctorProfileModal from '../components/DoctorProfileModal';

const specialties = [
  'General Physician', 'Cardiologist', 'Dermatologist', 
  'Pediatrician', 'Neurologist', 'Psychiatrist', 
  'Orthopedic', 'Ophthalmologist', 'ENT Specialist'
];

export default function FindDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await doctorsAPI.listPublic(selectedSpecialty);
      setDoctors(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/90 to-primary p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-none px-4 py-1">
            Top Rated Professionals
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
            Find the Perfect <br /> Specialist for Your Health
          </h1>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg">
            Connect with board-certified doctors for video consultations, prescriptions, and expert medical advice.
          </p>
          
          <div className="relative flex items-center max-w-xl group">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name or specialty..." 
              className="pl-12 py-7 rounded-2xl bg-white/95 border-none text-foreground text-lg shadow-lg focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl mb-10" />
        <div className="absolute top-1/2 right-20 hidden lg:block">
            <Stethoscope className="w-48 h-48 text-white/10 rotate-12" />
        </div>
      </div>

      {/* Specialty Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Browse by Specialty
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedSpecialty(null)}
            className={!selectedSpecialty ? 'hidden' : 'text-primary hover:text-primary/80'}
          >
            Clear Filters
          </Button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(selectedSpecialty === spec ? null : spec)}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
                selectedSpecialty === spec 
                  ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-[2rem] overflow-hidden border-none shadow-md">
              <CardHeader className="flex-row gap-4 space-y-0 p-6">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc, idx) => (
            <Card 
              key={doc._id || idx} 
              className="group rounded-[2rem] overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-500 bg-card/50 backdrop-blur-sm hover:-translate-y-2"
            >
              <CardHeader className="flex-row gap-4 space-y-0 p-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 rounded-2xl border-2 border-white shadow-lg transition-transform duration-500 group-hover:scale-110">
                    <AvatarImage src={doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`} />
                    <AvatarFallback>{doc.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white shadow-sm" title="Available Now" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{doc.name}</CardTitle>
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-500" />
                        4.9
                    </div>
                  </div>
                  <CardDescription className="text-primary font-medium text-sm tracking-wide uppercase">{doc.specialization || 'General Physician'}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary" title="Booked" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-white" title="Pending" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Live Schedule Enabled</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <div className="p-1.5 rounded-lg bg-muted">
                            <Clock className="w-4 h-4" />
                        </div>
                        <span>{doc.experience || '5'}+ Years Exp.</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <div className="p-1.5 rounded-lg bg-muted">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <span className="truncate">{doc.address || 'Global'}</span>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-lg py-1 bg-primary/5 text-primary border-none">
                    ${doc.consultationFee || '100'} / session
                  </Badge>
                  <Badge variant="secondary" className="rounded-lg py-1">Telemedicine</Badge>
                  <Badge variant="secondary" className="rounded-lg py-1">Verified</Badge>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button 
                  onClick={() => { setSelectedDoctor(doc); setIsModalOpen(true); }}
                  className="w-full rounded-2xl py-6 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border-none transition-all duration-300 group/btn font-semibold shadow-none hover:shadow-lg"
                >
                  View Profile & Book
                  <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold">No doctors found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
                We couldn't find any doctors matching your search or filter. Try adjusting your criteria.
            </p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedSpecialty(null); }} className="rounded-xl px-8">
                Reset All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <Card className="rounded-[2.5rem] border-none shadow-lg bg-gradient-to-r from-muted/50 to-muted/20 p-8">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                    <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold">Verified Doctors</h4>
                <p className="text-sm text-muted-foreground">Every doctor on our platform is board-certified and undergoes a strict verification process.</p>
            </div>
            <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                    <Clock className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold">Instant Booking</h4>
                <p className="text-sm text-muted-foreground">Skip the waiting room. Book an appointment and connect with your doctor in minutes.</p>
            </div>
            <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto md:mx-0">
                    <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold">Global Access</h4>
                <p className="text-sm text-muted-foreground">Access top specialists from around the world from the comfort of your home.</p>
            </div>
        </div>
      </Card>

      <DoctorProfileModal 
        doctor={selectedDoctor} 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedDoctor(null); }} 
      />
    </div>
  );
}
