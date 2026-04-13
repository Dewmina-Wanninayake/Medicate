import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export function SecurityIndicator() {
  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm">Security Active</h3>
          <p className="text-xs text-gray-600">All connections encrypted</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-gray-700">AES-256 Encryption</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-gray-700">TLS 1.3 Transport</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-gray-700">MFA Enabled</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-gray-700">Audit Logging Active</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">HIPAA Compliant</span>
          <Lock className="w-3 h-3 text-green-600" />
        </div>
      </div>
    </div>
  );
}
