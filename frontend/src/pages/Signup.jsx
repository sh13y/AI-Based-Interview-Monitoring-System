import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PasswordInput, EmailInput, TextInput, FormError, FileUploadInput } from '../components/ui/FormComponents';

const Signup = () => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      userId: '',
      email: '',
      password: '',
      confirmPassword: '',
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
    if (!pwd) return { strength: 0, text: '', color: 'bg-gray-600' };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd)) strength++;
    const levels = [
      { strength: 0, text: '', color: 'bg-gray-600' },
      { strength: 1, text: 'Weak', color: 'bg-red-500' },
      { strength: 2, text: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, text: 'Good', color: 'bg-blue-500' },
      { strength: 4, text: 'Strong', color: 'bg-sage' }
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
    });

    if (result.success) {
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col" style={{
      backgroundImage: 'url(/Loginbackground.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundRepeat: 'repeat-y',
      backgroundColor: '#e8e8e0'
    }}>
      {/* Header - Full width dark navy */}
      <div className="w-full bg-gray-900">
        <div className="flex items-center px-8 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Modern Matrix" className="w-30 h-9" />
            {/* <h1 className="text-sage font-semibold text-base tracking-wide">Modern Matrix</h1> */}
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full" style={{ maxWidth: '900px' }}>
          {/* Dark Card */}
          <div className="bg-gray-900 rounded-3xl shadow-2xl p-8">
            {/* Title */}
            <h2 className="text-center text-sage text-3xl font-bold mb-8 tracking-wide">CREATE YOUR PROFILE</h2>

            {error && <FormError message={error} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Left Column - Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-white text-sm font-semibold mb-4 text-left">Personal Information</h3>

                  {/* First Name and Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-gray-400 text-xs font-medium block text-left">First Name</label>
                      <Controller
                        name="firstName"
                        control={control}
                        rules={{ required: 'First name is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter First Name"
                            className="w-full px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition placeholder-gray-600"
                          />
                        )}
                      />
                      {errors.firstName && <p className="text-red-400 text-xs">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-400 text-xs font-medium block text-left">Last Name</label>
                      <Controller
                        name="lastName"
                        control={control}
                        rules={{ required: 'Last name is required' }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter Last Name"
                            className="w-full px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition placeholder-gray-600"
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Account Role Selector */}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-xs font-medium block text-left">Account Role</label>
                    <Controller
                      name="role"
                      control={control}
                      defaultValue="HR_Manager"
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition cursor-pointer text-xs"
                        >
                          <option value="HR_Manager">HR Manager / Recruiter</option>
                          <option value="Admin">System Administrator (Admin)</option>
                        </select>
                      )}
                    />
                  </div>

                  {/* Profile Picture */}
                  <div className="space-y-2">
                    <label className="text-white text-xs font-semibold block text-left">Profile Picture</label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-sage transition bg-gray-800/50">
                      {profilePicture ? (
                        <div>
                          <img src={profilePicture} alt="Profile Preview" className="w-16 h-16 rounded-lg object-cover mx-auto mb-2" />
                          <p className="text-sage text-xs font-semibold">✓ Image uploaded</p>
                          <label htmlFor="profilePicture" className="text-gray-500 text-xs cursor-pointer hover:text-sage mt-1 block">
                            Click to change
                          </label>
                        </div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-600 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <p className="text-gray-500 text-xs">
                            Drag & drop your photo or <label htmlFor="profilePicture" className="text-sage cursor-pointer font-semibold">browse</label>
                          </p>
                        </>
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
                  <h3 className="text-white text-sm font-semibold mb-4 text-left">Account Security</h3>

                  {/* Work Email */}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-xs font-medium block text-left">Work Email</label>
                    <EmailInput
                      name="email"
                      control={control}
                      errors={errors}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-xs font-medium block text-left">Password</label>
                    <PasswordInput
                      label=""
                      name="password"
                      control={control}
                      errors={errors}
                      required
                    />
                    {password && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`h-1.5 flex-1 rounded ${passwordStrength.color}`}></div>
                        <span className="text-xs text-gray-400">{passwordStrength.text}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-gray-400 text-xs font-medium block text-left">Confirm Password</label>
                    <PasswordInput
                      label=""
                      name="confirmPassword"
                      control={control}
                      errors={errors}
                      required
                    />
                  </div>

                  {/* Terms & Privacy */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <Controller
                        name="termsAccepted"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="checkbox"
                            className="w-4 h-4 bg-gray-800 border border-gray-700 rounded text-sage focus:ring-sage cursor-pointer flex-shrink-0"
                          />
                        )}
                      />
                      <label className="text-gray-400 text-xs">
                        <span className="text-white font-semibold block text-xs">Terms & Privacy</span>
                        <span className="text-xs">I agree to the Terms of Service and have read the 30 day data purge policy.</span>
                      </label>
                    </div>
                    {errors.termsAccepted && <p className="text-red-400 text-xs">{errors.termsAccepted.message}</p>}
                  </div>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 mt-6 bg-sage hover:bg-sage/90 text-gray-900 font-semibold rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            {/* Create Account Link */}
            <p className="text-center text-gray-400 text-xs mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-sage hover:text-sage/80 font-semibold transition">
                Log in now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
