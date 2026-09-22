import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FormError } from '../components/ui/FormComponents';

const Login = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      userId: '',
      password: '',
    }
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    const result = await login({
      userId: data.userId,
      password: data.password,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0E16] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-card border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight font-display">Modern Matrix AI</h1>
            <p className="text-[10px] font-mono text-gray-400">Intelligent Interview Proctoring System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-beacon" />
          <span className="text-xs font-mono text-gray-400">Aegis v4.2 Online</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
                Operator Sign In
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Enter your credentials to access the proctor cockpit
              </p>
            </div>

            {error && <FormError message={error} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-gray-300 text-xs font-mono uppercase tracking-wider block">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Controller
                    name="userId"
                    control={control}
                    rules={{
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        placeholder="admin@modernmatrix.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0A0E16] text-gray-200 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition placeholder-gray-600 font-mono"
                      />
                    )}
                  />
                </div>
                {errors.userId && (
                  <p className="text-rose-400 text-xs font-mono mt-1">{errors.userId.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-gray-300 text-xs font-mono uppercase tracking-wider block">
                    Security Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-gray-400 hover:text-emerald-400 text-xs font-mono transition"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: 'Password is required'
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#0A0E16] text-gray-200 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition placeholder-gray-600 font-mono"
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-400 text-xs font-mono mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-6 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 font-display"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Authenticate & Enter Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-gray-400 text-xs">
                Need an evaluator account?{' '}
                <Link to="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
                  Request access
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs font-mono text-gray-500 border-t border-white/5">
        Modern Matrix AI Proctor Framework • Cryptographically Sealed Sessions
      </footer>
    </div>
  );
};

export default Login;
