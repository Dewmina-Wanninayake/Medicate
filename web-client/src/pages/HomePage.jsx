// src/pages/HomePage.jsx
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Heart, Calendar, Shield, Stethoscope, ArrowRight, Video, Clock, Star } from 'lucide-react';
import Logo from '../assets/medicate-logo.png';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const features = [
  { icon: Video, title: 'Video Consultations', desc: 'Secure HD video calls with certified doctors from anywhere, anytime.' },
  { icon: Calendar, title: 'Easy Booking', desc: 'Book appointments in seconds with our streamlined booking system.' },
  { icon: Clock, title: '24/7 Availability', desc: 'Access healthcare services round the clock with our global network.' },
  { icon: Shield, title: 'Secure & Private', desc: 'End-to-end encryption for all consultations and medical records.' },
  { icon: Stethoscope, title: 'AI Diagnostics', desc: 'Interactive symptom checkers and AI-powered health analysis tools.' },
  { icon: Star, title: 'Top Specialists', desc: 'Connect with verified and board-certified medical professionals.' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 pb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 rounded-full bg-secondary text-secondary-foreground">
              AI-Powered Healthcare
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Your Health,<br />
              <span className="text-primary">Our Priority</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-12 max-w-lg">
              Connect with top doctors instantly. Get AI-powered symptom analysis and book telemedicine consultations from the comfort of your home.
            </p>

            {/* AI Symptom Checker Container */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm max-w-lg">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">AI Symptom Checker</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Describe your symptoms..."
                  className="flex-1 bg-transparent border border-primary/30 rounded-full px-6 py-3 outline-none focus:border-primary transition-colors text-sm"
                />
                <Button className="rounded-full px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-auto">
                  Analyze
                </Button>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative h-full flex items-center justify-end">
            <div className="relative w-full max-w-[500px] rounded-[48px] overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop"
                alt="Doctor holding phone"
                className="w-full h-auto object-cover aspect-[4/3] md:aspect-[4/5]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 rounded-full bg-secondary text-secondary-foreground">Why Choose Us</Badge>
          <h2 className="text-3xl font-bold mb-4">Comprehensive Healthcare at Your Fingertips</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We combine advanced AI technology with certified healthcare professionals to deliver the best care experience.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <Card
              key={f.title}
              className="rounded-[32px] border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-gradient-to-br from-card to-muted/30"
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16 mb-16">
        <Card className="rounded-[48px] bg-gradient-to-r from-primary to-accent text-white border-none shadow-2xl overflow-hidden">
          <CardContent className="p-16 text-center relative">
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of patients who trust Medicate for their healthcare needs
              </p>
              <Link to="/register">
                <Button size="lg" className="rounded-full px-12 py-6 text-lg bg-white text-primary hover:bg-white/90 shadow-xl h-auto">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src={Logo} alt="Medicate Logo" className="h-24 w-auto mb-4" />
              <p className="text-sm text-muted-foreground">AI-enabled smart healthcare and telemedicine platform</p>
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
    </div>
  );
}
