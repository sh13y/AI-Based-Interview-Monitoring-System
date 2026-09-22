import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Shield, CheckCircle2, AlertCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const email = searchParams.get('email');

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!isSupabaseConfigured()) {
        if (isMounted) setStatus('waiting');
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (sessionError) {
        setStatus('error');
        setError(sessionError.message);
        return;
      }

      if (session?.user?.email_confirmed_at) {
        setStatus('success');
        setTimeout(() => {
          if (isMounted) navigate('/login');
        }, 3000);
        return;
      }

      setStatus('waiting');
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0E16] flex items-center justify-center p-4">
        <div className="glass-panel rounded-3xl border border-white/10 p-8 text-center max-w-sm w-full shadow-2xl">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
          <h2 className="text-white text-lg font-bold font-display mb-1">Verifying Credentials</h2>
          <p className="text-gray-400 text-xs font-mono">Querying cryptographic authentication cluster...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0A0E16] flex items-center justify-center p-4">
        <div className="glass-panel rounded-3xl border border-white/10 p-8 text-center max-w-md w-full shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Email Verified!</h2>
          <p className="text-gray-300 text-xs leading-relaxed font-mono">
            Your operator email has been cryptographically validated. You can now access the Aegis proctoring console.
          </p>
          <p className="text-xs text-gray-500 font-mono">Redirecting to login in 3 seconds...</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 font-display"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#0A0E16] flex items-center justify-center p-4">
        <div className="glass-panel rounded-3xl border border-white/10 p-8 text-center max-w-md w-full shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Verification Failed</h2>
          <p className="text-rose-400 text-xs font-mono">{error}</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-surface-card hover:bg-surface-elevated text-gray-200 border border-white/10 text-xs rounded-xl transition font-mono"
          >
            Try Registration Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E16] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-panel rounded-3xl border border-white/10 p-8 sm:p-10 text-center max-w-md w-full shadow-2xl space-y-5 relative z-10">
        <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
          <Mail className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white font-display">Verify Your Identity</h2>
        <p className="text-gray-300 text-xs font-mono leading-relaxed">
          {email
            ? `We have dispatched a verification link to ${email}. Check your inbox and click the link to activate your proctor credentials.`
            : 'Check your inbox and click the verification link to activate your evaluator account.'}
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 font-display"
          >
            <span>Back to Console Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
