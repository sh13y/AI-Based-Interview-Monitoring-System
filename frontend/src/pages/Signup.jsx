import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PasswordInput, EmailInput, FormError, FileUploadInput } from '../components/ui/FormComponents';

const Signup = () => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      userId: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'HR_Manager',
      profilePicture: null,
      termsAccepted: false,
    }
  });

  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const password = watch('password');
  const profilePicture = watch('profilePicture');

  // Password strength indicator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, text: '', color: 'bg-white/10' };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)) strength++;
    const levels = [
      { strength: 0, text: '', color: 'bg-white/10' },
      { strength: 1, text: 'Weak', color: 'bg-rose-500' },
      { strength: 2, text: 'Fair', color: 'bg-amber-500' },
      { strength: 3, text: 'Good', color: 'bg-blue-500' },
      { strength: 4, text: 'Strong', color: 'bg-emerald-500' }
    ];
    return levels[strength] || levels[0];
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    setError('');
    if (!data.termsAccepted) {
      setError('You must agree to the Terms & Privacy to continue');
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await signup({
      firstName: data.firstName,
      lastName: data.lastName,
      userId: data.userId,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      profilePicture: data.profilePicture,
      role: data.role || 'HR_Manager',
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to create account. Please check your details.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0E16] flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-black">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

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
          <span className="text-xs font-mono text-gray-400">Aegis v4.2 Onboarding</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-3xl">
          <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display tracking-tight">
                Operator Registration
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Provision high-trust evaluator credentials with cryptographical verification
              </p>
            </div>

            {error && <FormError message={error} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-white text-xs font-mono uppercase tracking-wider font-semibold border-b border-white/10 pb-2">
                    Personnel Dossier
                  </h3>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-gray-400 text-xs font-mono block">First Name</label>
                      <Controller
                        name="firstName"
                        control={control}
                        rules={{ required: 'First name is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="Alex"
                            className="w-full px-3.5 py-2.5 bg-[#0A0E16] text-gray-200 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 transition font-mono"
                          />
                        )}
                      />
                      {errors.firstName && <p className="text-rose-400 text-xs font-mono">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-gray-400 text-xs font-mono block">Last Name</label>
                      <Controller
                        name="lastName"
                        control={control}
                        rules={{ required: 'Last name is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="Vance"
                            className="w-full px-3.5 py-2.5 bg-[#0A0E16] text-gray-200 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 transition font-mono"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Account Role Selector */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-xs font-mono block">Evaluation Role</label>
                    <Controller
                      name="role"
                      control={control}
                      defaultValue="HR_Manager"
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-3.5 py-2.5 bg-[#0A0E16] text-gray-200 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 transition font-mono cursor-pointer"
                        >
                          <option value="HR_Manager">HR Manager / Technical Evaluator</option>
                          <option value="Admin">System Administrator (Chief Proctor)</option>
                        </select>
                      )}
                    />
                  </div>

                  {/* Profile Picture */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-xs font-mono block">Operator Avatar</label>
                    <div className="border border-dashed border-white/15 rounded-xl p-4 text-center hover:border-emerald-500/40 transition bg-[#0A0E16]/60">
                      {profilePicture ? (
                        <div>
                          <img src={profilePicture} alt="Avatar Preview" className="w-14 h-14 rounded-xl object-cover mx-auto mb-2 border border-emerald-500/30" />
                          <p className="text-emerald-400 text-xs font-mono">✓ Image uploaded</p>
                          <label htmlFor="profilePicture" className="text-gray-500 text-xs cursor-pointer hover:text-emerald-400 mt-1 block">
                            Replace
                          </label>
                        </div>
                      ) : (
                        <div>
                          <User className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                          <p className="text-gray-400 text-xs font-mono">
                            Drag & drop avatar photo or <label htmlFor="profilePicture" className="text-emerald-400 cursor-pointer font-semibold">browse</label>
                          </p>
                        </div>
                      )}
                      <FileUploadInput
                        name="profilePicture"
                        control={control}
                        errors={errors}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Account Security */}
                <div className="space-y-4">
                  <h3 className="text-white text-xs font-mono uppercase tracking-wider font-semibold border-b border-white/10 pb-2">
                    Security Credentials
                  </h3>

                  {/* Work Email */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-xs font-mono block">Corporate Email</label>
                    <EmailInput
                      name="email"
                      control={control}
                      errors={errors}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-xs font-mono block">Master Password</label>
                    <PasswordInput
                      label=""
                      name="password"
                      control={control}
                      errors={errors}
                      required
                    />
                    {password && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className={`h-1.5 flex-1 rounded-full ${passwordStrength.color}`} />
                        <span className="text-[11px] font-mono text-gray-400">{passwordStrength.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-xs font-mono block">Confirm Password</label>
                    <PasswordInput
                      label=""
                      name="confirmPassword"
                      control={control}
                      errors={errors}
                      required
                    />
                  </div>

                  {/* Terms */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <Controller
                        name="termsAccepted"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded bg-[#0A0E16] border border-white/20 text-emerald-500 focus:ring-0 cursor-pointer"
                          />
                        )}
                      />
                      <span className="text-xs text-gray-400 leading-relaxed">
                        I accept the <span className="text-white font-semibold">Proctor Terms of Integrity</span> and biometric evaluation data retention policy.
                      </span>
                    </label>
                    {errors.termsAccepted && (
                      <p className="text-rose-400 text-xs font-mono mt-1">{errors.termsAccepted.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-surface font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 font-display"
              >
                {loading ? 'Registering Operator...' : 'Create Proctor Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-gray-400 text-xs">
                Already registered?{' '}
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
                  Sign in to console
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

export default Signup;
