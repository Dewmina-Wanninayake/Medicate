import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Loader2, 
  Search, ArrowRight, CornerDownRight, ShieldCheck,
  AlertTriangle, Stethoscope
} from 'lucide-react';
import { symptomsAPI } from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function SymptomWizard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please describe how you are feeling');
      return;
    }
    
    if (query.trim().length < 10) {
      toast.error('Please provide a bit more detail for an accurate analysis');
      return;
    }

    setLoading(true);
    try {
      // We pass the whole natural language string as the 'symptoms' array's first element
      const data = await symptomsAPI.check([query.trim()]);
      setResult(data.analysis);
    } catch (err) {
      console.error(err);
      toast.error('Analysis failed. Please try again or simplify your description.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setQuery('');
    setResult(null);
  };

  if (result) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-6 rounded-3xl bg-primary text-primary-foreground shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tight">AI Assessment</h3>
          </div>
          
          <div className="space-y-4 relative z-10">
            {result.possibleConditions.map((c, idx) => (
              <div key={idx} className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-sm uppercase tracking-wider">{c.condition}</span>
                  <Badge className={`text-[10px] h-5 rounded-full px-3 ${
                    c.likelihood === 'high' ? 'bg-red-500' : 
                    c.likelihood === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}>
                    {c.likelihood}
                  </Badge>
                </div>
                <p className="text-xs opacity-90 leading-relaxed font-medium">{c.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 relative z-10">
            <div className="flex items-start gap-2">
              <CornerDownRight className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
              <p className="text-xs font-bold leading-relaxed">{result.preliminaryAdvice}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={() => navigate('/find-doctors')}
            className="w-full rounded-full h-14 text-md font-black bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/20 transition-all active:scale-95"
          >
            Book Consultation
          </Button>
          <Button 
            variant="ghost" 
            onClick={reset}
            className="w-full rounded-full h-12 text-xs font-bold text-muted-foreground hover:bg-muted/50"
          >
            Start New Search
          </Button>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 leading-tight italic font-medium">
            {result.disclaimer}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="relative group">
          <textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
            placeholder="I have a slight headache and feeling dizzy for the past two days..." 
            className="w-full min-h-[140px] rounded-[32px] p-6 pr-12 bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background outline-none transition-all font-medium text-sm resize-none shadow-inner"
          />
        </div>

        <div className="flex flex-wrap gap-2 px-2">
          {['Fever', 'Migraine', 'Back pain', 'Cough'].map(tag => (
            <button 
              key={tag}
              onClick={() => setQuery(q => q ? `${q}, ${tag}` : tag)}
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors bg-muted/20 px-3 py-1 rounded-full border border-transparent hover:border-primary/20"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      <Button 
        disabled={loading || query.length < 5}
        onClick={handleSearch}
        className="w-full rounded-full h-16 text-lg font-black bg-primary hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 group active:scale-95"
      >
        {loading ? (
          <><Loader2 className="mr-2 w-6 h-6 animate-spin" /> Clinical Analysis...</>
        ) : (
          <><Search className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" /> Analyze Health <ArrowRight className="ml-2 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></>
        )}
      </Button>

      <div className="flex justify-center items-center gap-6 pt-2">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
          <ShieldCheck className="w-3 h-3 text-primary/40" />
          HIPAA Compliant
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
          <Stethoscope className="w-3 h-3 text-primary/40" />
          Medical Grade AI
        </div>
      </div>
    </div>
  );
}
