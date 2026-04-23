import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Stethoscope, AlertTriangle, ShieldCheck, ChevronRight, 
  ArrowLeft, Loader2, Sparkles, Activity, Plus, X,
  Clock, Thermometer, User, HeartPulse
} from 'lucide-react';
import { symptomsAPI } from '../services/api';
import { toast } from 'sonner';

const COMMON_SYMPTOMS = [
  'Headache', 'Fever', 'Cough', 'Fatigue', 'Chest Pain', 
  'Shortness of breath', 'Nausea', 'Dizziness', 'Sore Throat',
  'Muscle Pain', 'Abdominal Pain', 'Skin Rash'
];

export default function SymptomCheckerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [context, setContext] = useState({
    age: '',
    gender: 'prefer_not_to_say',
    duration: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const addSymptom = (s) => {
    const term = s.trim();
    if (!term) return;
    if (symptoms.includes(term)) return;
    setSymptoms([...symptoms, term]);
    setInputValue('');
  };

  const removeSymptom = (s) => {
    setSymptoms(symptoms.filter(item => item !== s));
  };

  const handleCheck = async () => {
    if (symptoms.length === 0) {
      toast.error('Please add at least one symptom');
      return;
    }
    setLoading(true);
    try {
      const fullContext = `Age: ${context.age}, Gender: ${context.gender}, Duration: ${context.duration}. ${context.additionalInfo}`;
      const data = await symptomsAPI.check(symptoms, fullContext);
      setResult(data.analysis);
      setStep(3);
    } catch (err) {
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
            AI Symptom Checker
          </h1>
          <p className="text-muted-foreground font-medium">Get instant medical insights powered by advanced AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Progress bar */}
        <div className="flex gap-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="bg-primary transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }} 
          />
        </div>

        {step === 1 && (
          <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black">What are your symptoms?</CardTitle>
              <CardDescription className="text-lg">Select common symptoms or type your own below.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map(s => (
                  <Badge 
                    key={s}
                    variant={symptoms.includes(s) ? 'default' : 'outline'}
                    className={`rounded-full px-4 py-2 cursor-pointer transition-all ${symptoms.includes(s) ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
                    onClick={() => symptoms.includes(s) ? removeSymptom(s) : addSymptom(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="relative">
                <Input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSymptom(inputValue)}
                  placeholder="Type a symptom (e.g. Back pain)..." 
                  className="rounded-full h-16 pl-6 pr-20 bg-muted/30 border-none font-medium text-lg"
                />
                <Button 
                  onClick={() => addSymptom(inputValue)}
                  className="absolute right-2 top-2 rounded-full h-12 px-6 bg-primary"
                >
                  <Plus className="w-5 h-5 mr-2" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 min-h-[60px] p-6 rounded-[32px] bg-primary/5 border border-primary/10">
                {symptoms.length === 0 ? (
                  <p className="text-muted-foreground italic m-auto">No symptoms added yet.</p>
                ) : (
                  symptoms.map(s => (
                    <Badge key={s} className="rounded-full px-4 py-2 bg-white text-primary shadow-sm border-none flex items-center gap-2 font-bold uppercase tracking-wider text-[10px]">
                      {s}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeSymptom(s)} />
                    </Badge>
                  ))
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  disabled={symptoms.length === 0}
                  onClick={() => setStep(2)}
                  className="rounded-full h-16 px-10 text-lg font-black bg-primary hover:bg-accent transition-all shadow-xl shadow-primary/20"
                >
                  Next Step <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-2xl font-black">Tell us more</CardTitle>
              <CardDescription className="text-lg">Accurate context helps us provide better analysis.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-4">Age</label>
                  <Input 
                    type="number"
                    value={context.age}
                    onChange={(e) => setContext({...context, age: e.target.value})}
                    placeholder="e.g. 28" 
                    className="rounded-full h-14 bg-muted/30 border-none px-6"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-4">Duration</label>
                  <Input 
                    value={context.duration}
                    onChange={(e) => setContext({...context, duration: e.target.value})}
                    placeholder="e.g. 2 days" 
                    className="rounded-full h-14 bg-muted/30 border-none px-6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-4">Additional Details</label>
                <textarea 
                  value={context.additionalInfo}
                  onChange={(e) => setContext({...context, additionalInfo: e.target.value})}
                  className="w-full min-h-[150px] rounded-[32px] p-6 bg-muted/30 border-none outline-none focus:ring-2 ring-primary/20 transition-all font-medium"
                  placeholder="Describe anything else... (e.g. any existing medical conditions, medications you're taking)"
                />
              </div>

              <div className="flex justify-between items-center pt-6">
                <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full h-14 px-8 font-bold">
                  <ArrowLeft className="mr-2 w-5 h-5" /> Back
                </Button>
                <Button 
                  onClick={handleCheck}
                  disabled={loading}
                  className="rounded-full h-16 px-12 text-lg font-black bg-primary hover:bg-accent transition-all shadow-xl shadow-primary/20"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 w-6 h-6 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Activity className="mr-2 w-6 h-6" /> Get Analysis</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && result && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Urgent Alert if needed */}
            {result.urgencyLevel === 'emergency' && (
              <div className="bg-red-500 text-white p-8 rounded-[40px] flex items-center gap-6 shadow-2xl shadow-red-500/30">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black uppercase tracking-widest mb-1">Emergency Warning</h3>
                  <p className="font-bold">Our AI recommends immediate medical attention for these symptoms.</p>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
                  <CardHeader className="p-10 pb-0">
                    <CardTitle className="text-2xl font-black flex items-center gap-3">
                      <Stethoscope className="w-7 h-7 text-primary" />
                      Possible Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-6">
                    {result.possibleConditions.map((c, idx) => (
                      <div key={idx} className="p-6 rounded-[32px] bg-muted/20 border border-border/50">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-black text-primary">{c.condition}</h4>
                          <Badge className={`rounded-full px-4 ${
                            c.likelihood === 'high' ? 'bg-red-500' : 
                            c.likelihood === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}>
                            {c.likelihood.toUpperCase()} Likelihood
                          </Badge>
                        </div>
                        <p className="text-muted-foreground font-medium leading-relaxed">{c.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-primary text-primary-foreground">
                  <CardContent className="p-10 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="w-8 h-8" />
                      <h3 className="text-2xl font-black">Preliminary Advice</h3>
                    </div>
                    <p className="text-lg font-bold opacity-90 leading-relaxed">{result.preliminaryAdvice}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card className="rounded-[40px] border-none shadow-xl bg-white overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black uppercase tracking-widest text-primary">Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                    <div className="space-y-4">
                      <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Recommended Specialists</p>
                      <div className="flex flex-wrap gap-2">
                        {result.recommendedSpecialties.map(s => (
                          <Badge key={s} variant="outline" className="rounded-full px-4 py-2 border-primary/20 text-primary font-bold">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => navigate('/find-doctors')}
                      className="w-full rounded-full h-16 text-lg font-black bg-primary hover:bg-accent shadow-xl shadow-primary/20"
                    >
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>

                <div className="p-8 rounded-[32px] bg-amber-50 border border-amber-100">
                  <p className="text-xs font-bold text-amber-800 leading-relaxed italic">
                    <AlertTriangle className="w-4 h-4 inline mr-2 mb-1" />
                    {result.disclaimer}
                  </p>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setStep(1);
                    setSymptoms([]);
                    setResult(null);
                  }}
                  className="w-full rounded-full h-14 font-bold"
                >
                  Check New Symptoms
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6 opacity-60">
        <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all">
          <ShieldCheck className="w-10 h-10 mb-4 text-primary" />
          <h4 className="font-bold mb-1">Privacy First</h4>
          <p className="text-xs">Your data is encrypted and never shared.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all">
          <HeartPulse className="w-10 h-10 mb-4 text-primary" />
          <h4 className="font-bold mb-1">Smart Triage</h4>
          <p className="text-xs">Patterns recognized across 10k+ medical cases.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 grayscale hover:grayscale-0 transition-all">
          <User className="w-10 h-10 mb-4 text-primary" />
          <h4 className="font-bold mb-1">Verified Care</h4>
          <p className="text-xs">Connected to board-certified specialists.</p>
        </div>
      </div>
    </div>
  );
}
