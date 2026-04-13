import { useState } from 'react';
import { Activity, Thermometer, Brain, Sparkles, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export default function AISymptomChecker({ onSuggestionContext }) {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const handleAnalysis = () => {
    if (!symptoms.trim()) return;
    
    setIsLoading(true);
    setAiAnalysis(null);

    // Mock API Call to AI/ML Engine
    setTimeout(() => {
      setIsLoading(false);
      const result = {
        suggestion: "Based on the reported symptoms, it is recommended to consult a specialist.",
        recommendedSpecialty: "General Medicine / Internal Medicine",
        urgency: "Moderate",
        keywords: symptoms.split(' ').filter(w => w.length > 4).slice(0, 3)
      };
      setAiAnalysis(result);
      if (onSuggestionContext) {
        onSuggestionContext(result.recommendedSpecialty);
      }
    }, 1500);
  };

  return (
    <Card className="rounded-[32px] border-none shadow-xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Brain className="w-48 h-48 text-indigo-500" />
      </div>

      <CardContent className="p-8 relative z-10">
        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none rounded-full px-4 py-1.5 mb-6 flex items-center w-max gap-2 shadow-sm">
          <Sparkles className="w-4 h-4" />
          AI Intelligence Engine
        </Badge>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Smart Symptom Checker</h2>
        <p className="text-muted-foreground mb-8 text-lg max-w-lg">
          Describe your symptoms. Our ML engine analyzes them instantly to recommend the best medical specialty.
        </p>

        <div className="flex gap-4">
          <Input 
            placeholder="e.g. 'I have a severe headache and slight fever...'" 
            className="rounded-full pl-6 h-14 text-lg bg-white/80 border-indigo-100 shadow-sm flex-1"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalysis()}
          />
          <Button 
            className="rounded-full px-8 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center gap-2"
            onClick={handleAnalysis}
            disabled={isLoading || !symptoms.trim()}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
            Analyze
          </Button>
        </div>

        {aiAnalysis && (
          <div className="mt-8 animate-in slide-in-from-bottom-6 fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-indigo-900 mb-1">AI Recommendation</h4>
                  <p className="text-gray-700">{aiAnalysis.suggestion}</p>
                </div>
                <Badge variant={aiAnalysis.urgency === 'High' ? 'destructive' : 'secondary'} className="rounded-full px-3">
                  Urgency: {aiAnalysis.urgency}
                </Badge>
              </div>

              <div className="pt-4 border-t border-indigo-50">
                <span className="text-sm text-muted-foreground block mb-2">Recommended Specialty:</span>
                <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-1">
                  {aiAnalysis.recommendedSpecialty}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
