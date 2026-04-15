import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { User, Mail, Camera, Save, MapPin, Briefcase, Globe } from 'lucide-react';

export default function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <Button 
          variant={isEditing ? "default" : "outline"} 
          className="rounded-full gap-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : "Edit Profile"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="md:col-span-1 rounded-[40px] border-none shadow-lg overflow-hidden h-fit">
          <div className="h-32 bg-gradient-to-br from-primary to-accent relative">
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-full border-4 border-card bg-muted flex items-center justify-center relative overflow-hidden group">
                <User className="w-12 h-12 text-muted-foreground" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-14 text-center pb-8">
            <h3 className="text-xl font-bold">Dr. Sarah Johnson</h3>
            <p className="text-sm text-muted-foreground mb-4">Senior Cardiologist</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">Verified</Badge>
              <Badge variant="secondary" className="rounded-full">10+ Years Exp</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Info Form */}
        <Card className="md:col-span-2 rounded-[40px] border-none shadow-lg">
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <Input defaultValue="Sarah Johnson" disabled={!isEditing} className="rounded-2xl border-none bg-muted/50 h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
                <Input defaultValue="sarah.j@medicate.com" disabled={!isEditing} className="rounded-2xl border-none bg-muted/50 h-12" />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialty</label>
               <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-2xl">
                 <div className="bg-primary/10 p-2 rounded-xl"><Briefcase className="w-5 h-5 text-primary" /></div>
                 <Input defaultValue="Cardiology, Internal Medicine" disabled={!isEditing} className="border-none bg-transparent focus-visible:ring-0 h-10" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</label>
               <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-2xl">
                 <div className="bg-primary/10 p-2 rounded-xl"><MapPin className="w-5 h-5 text-primary" /></div>
                 <Input defaultValue="Main City Hospital, Wing B" disabled={!isEditing} className="border-none bg-transparent focus-visible:ring-0 h-10" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bio / About</label>
               <textarea 
                 disabled={!isEditing} 
                 className="w-full rounded-2xl border-none bg-muted/50 p-4 text-sm focus:ring-1 focus:ring-primary min-h-[100px] outline-none"
                 defaultValue="Passionate cardiologist with focus on preventive medicine and non-invasive procedures. Committed to patient education and long-term wellness."
               />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
