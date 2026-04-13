import { Shield, Lock, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';

export function SecurityIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64 scale-100 opacity-100' : 'w-12 h-12 cursor-pointer'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {!isExpanded ? (
        <div className="w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-pulse hover:animate-none">
          <Lock className="w-5 h-5 text-primary-foreground" />
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-2xl border border-border p-5 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-sm font-bold">Security Active</h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              'AES-256 Encryption',
              'TLS 1.3 Transport',
              'MFA Enabled',
              'HIPAA Compliant'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Encrypted Connection</span>
            <Lock className="w-3 h-3 text-green-600" />
          </div>
        </div>
      )}
    </div>
  );
}
