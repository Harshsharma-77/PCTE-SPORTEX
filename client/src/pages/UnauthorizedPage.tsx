import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-5 text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold uppercase tracking-wider">
          403 Access Denied
        </span>

        <h2 className="text-2xl font-bold text-white mt-4 mb-2">Insufficient Permissions</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Your current account role (<span className="text-sportex-400 font-mono font-bold">{user?.role || 'GUEST'}</span>) is not authorized to access this section of the sports management console.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to My Hub
            </Button>
          </Link>

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
