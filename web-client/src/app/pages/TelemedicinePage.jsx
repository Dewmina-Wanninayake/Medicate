import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  FileText,
  X,
  Maximize,
  User
} from 'lucide-react';
import { mockAppointments } from '../data/mockData';

export default function TelemedicinePage() {
  const { appointmentId } = useParams();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [notes, setNotes] = useState('');

  const appointment = mockAppointments.find(a => a.id === appointmentId);

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Appointment not found</h1>
          <Link to="/dashboard">
            <Button className="rounded-3xl">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold">
              Telemedicine Session - {appointment.patientName}
            </h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="destructive" className="rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Live
              </Badge>
              <span>{appointment.specialty}</span>
              <span>•</span>
              <span>Started at {appointment.time}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Duration: 12:34
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-gray-900">
          {/* Patient Video (Main) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
                alt="Patient"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-3xl">
                <User className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">
                  {appointment.patientName}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor Video (Picture-in-Picture) */}
          <div className="absolute top-6 right-6 w-64 h-48 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20">
            <div className="relative w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"
                alt="Doctor"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
                <span className="text-white text-sm font-semibold">You</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-card/95 backdrop-blur-lg px-6 py-4 rounded-[48px] shadow-2xl border border-border">
            <Button
              size="icon"
              variant={videoEnabled ? "default" : "destructive"}
              className="rounded-full w-14 h-14"
              onClick={() => setVideoEnabled(!videoEnabled)}
            >
              {videoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </Button>

            <Button
              size="icon"
              variant={audioEnabled ? "default" : "destructive"}
              className="rounded-full w-14 h-14"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            <Button
              size="icon"
              variant="destructive"
              className="rounded-full w-14 h-14"
            >
              <Phone className="w-6 h-6" />
            </Button>

            <div className="w-px h-8 bg-border mx-2"></div>

            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-12 h-12"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-12 h-12"
              onClick={() => setShowPrescription(!showPrescription)}
            >
              <FileText className="w-5 h-5" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-12 h-12"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Side Panel */}
        <aside className="w-96 bg-card border-l border-border flex flex-col">
          <div className="flex border-b border-border">
            <button
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                !showPrescription
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              onClick={() => setShowPrescription(false)}
            >
              Patient Info
            </button>
            <button
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                showPrescription
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              onClick={() => setShowPrescription(true)}
            >
              Prescription
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!showPrescription ? (
              <div className="space-y-6">
                <Card className="rounded-3xl border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Patient Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-semibold">{appointment.patientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age</span>
                        <span className="font-semibold">{appointment.patientAge} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Blood Type</span>
                        <Badge variant="secondary" className="rounded-full">A+</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {appointment.symptoms && (
                  <div>
                    <h3 className="font-semibold mb-3">Reported Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {appointment.symptoms.map((symptom, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="rounded-full"
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {appointment.aiInsights && (
                  <Card className="rounded-3xl bg-yellow-50 border-yellow-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-yellow-600">⚡</span>
                        AI Insights
                      </h3>
                      <p className="text-sm text-gray-700">
                        {appointment.aiInsights}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Session Notes</h3>
                  <Textarea
                    placeholder="Add consultation notes..."
                    className="rounded-3xl min-h-[150px] resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold mb-4">Digital Prescription</h3>
                
                <Card className="rounded-3xl">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Medication
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Amoxicillin 500mg"
                        className="w-full px-4 py-2 rounded-2xl border border-border bg-muted/30"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Dosage
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 3 times daily"
                        className="w-full px-4 py-2 rounded-2xl border border-border bg-muted/30"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 7 days"
                        className="w-full px-4 py-2 rounded-2xl border border-border bg-muted/30"
                      />
                    </div>

                    <Button className="w-full rounded-3xl bg-primary hover:bg-accent">
                      Add Medication
                    </Button>
                  </CardContent>
                </Card>

                <Button className="w-full rounded-3xl bg-green-600 hover:bg-green-700 text-white">
                  Send Prescription
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
