import { useState } from 'react';
import { Link } from 'react-router';
import { Search, Video, Calendar, Shield, Clock, Star, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { mockDoctors, specialties } from '../data/mockData';
import BookingModal from '../components/BookingModal';
import MobileNav from '../components/MobileNav';

export default function LandingPage() {
  const [symptomText, setSymptomText] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [aiResults, setAiResults] = useState(null);

  const handleSymptomCheck = () => {
    if (symptomText.trim()) {
      setAiResults(
        `Based on your symptoms: "${symptomText}", our AI suggests consulting with a Cardiologist or General Practitioner. Common causes include stress, anxiety, or cardiac concerns. Please book an appointment for proper diagnosis.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">


      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 pb-24 md:pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 rounded-full bg-secondary text-secondary-foreground">
              AI-Powered Healthcare
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Your Health,
              <br />
              <span className="text-primary">Our Priority</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with top doctors instantly. Get AI-powered symptom analysis and book telemedicine consultations from the comfort of your home.
            </p>
            
            {/* AI Symptom Checker */}
            <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 rounded-[32px] shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  AI Symptom Checker
                </h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Describe your symptoms..."
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                    className="rounded-3xl bg-white border-primary/30"
                    onKeyDown={(e) => e.key === 'Enter' && handleSymptomCheck()}
                  />
                  <Button 
                    className="rounded-3xl px-8 bg-primary hover:bg-accent"
                    onClick={handleSymptomCheck}
                  >
                    Analyze
                  </Button>
                </div>
                
                {aiResults && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-3xl border border-primary/20">
                    <p className="text-sm">{aiResults}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[48px] blur-3xl"></div>
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600"
              alt="Healthcare"
              className="relative rounded-[48px] shadow-2xl object-cover w-full h-[500px]"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="rounded-[32px] border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-muted/30">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Video Consultations</h3>
              <p className="text-muted-foreground">
                Secure HD video calls with certified doctors from anywhere, anytime.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-muted/30">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl mb-2">Easy Booking</h3>
              <p className="text-muted-foreground">
                Book appointments in seconds with our streamlined booking system.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-muted/30">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl mb-2">24/7 Availability</h3>
              <p className="text-muted-foreground">
                Access healthcare services round the clock with our global network.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialties" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl mb-8">Browse by Specialty</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {specialties.map((specialty) => (
            <Card
              key={specialty.name}
              className="flex-shrink-0 w-32 rounded-[28px] border-2 border-border hover:border-primary cursor-pointer transition-all hover:shadow-lg"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">{specialty.icon}</div>
                <p className="text-sm">{specialty.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Doctors */}
      <section id="doctors" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl">Popular Doctors</h2>
          <Button variant="ghost" className="rounded-3xl">
            View All <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {mockDoctors.slice(0, 6).map((doctor) => (
            <Card
              key={doctor.id}
              className="rounded-[32px] border-none shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer overflow-hidden bg-card"
              onClick={() => setSelectedDoctor(doctor.id)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
                {doctor.available && (
                  <Badge className="absolute top-4 right-4 rounded-full bg-green-500">
                    Available
                  </Badge>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl mb-1">{doctor.name}</h3>
                <Badge variant="secondary" className="rounded-full mb-3">
                  {doctor.specialty}
                </Badge>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-foreground">{doctor.rating}</span>
                    <span>({doctor.reviewCount})</span>
                  </div>
                  <div>{doctor.experience}y exp</div>
                </div>
                <Button className="w-full rounded-3xl bg-primary hover:bg-accent">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 mb-16">
        <Card className="rounded-[48px] bg-gradient-to-r from-primary to-accent text-white border-none shadow-2xl overflow-hidden">
          <CardContent className="p-16 text-center relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
            <div className="relative">
              <h2 className="text-4xl mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of patients who trust Medicate for their healthcare needs
              </p>
              <Button
                size="lg"
                className="rounded-full px-12 py-6 text-lg bg-white text-primary hover:bg-white/90 shadow-xl"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">Medicate</h3>
              <p className="text-sm text-muted-foreground">
                AI-enabled smart healthcare and telemedicine platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><a href="#" className="hover:text-primary">About Us</a></div>
                <div><a href="#" className="hover:text-primary">Our Doctors</a></div>
                <div><a href="#" className="hover:text-primary">Services</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><a href="#" className="hover:text-primary">Help Center</a></div>
                <div><a href="#" className="hover:text-primary">Contact Us</a></div>
                <div><a href="#" className="hover:text-primary">Privacy Policy</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>support@medicate.com</div>
                <div>+1 (555) 123-4567</div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2026 Medicate. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        open={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        doctor={mockDoctors.find(d => d.id === selectedDoctor)}
      />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
