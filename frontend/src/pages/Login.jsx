import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
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
        <div className="w-full" style={{ maxWidth: '600px' }}>
          {/* Dark Card */}
          <div className="bg-gray-900 rounded-3xl shadow-2xl px-10 py-8">
            {/* Title */}
            <h2 className="text-center text-sage text-3xl font-bold mb-8 tracking-wide">Welcome Back!</h2>

            {error && <FormError message={error} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Account Security Section */}
              <div>
                <h3 className="text-white text-sm font-semibold mb-5 text-left">Account Security</h3>

                {/* User ID Field */}
                <div className="space-y-2 mb-5">
                  <label className="text-gray-400 text-xs font-medium block text-left">User ID</label>
                  <Controller
                    name="userId"
                    control={control}
                    rules={{
                      required: 'User ID is required'
                    }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Enter User ID"
                        className="w-full px-4 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition placeholder-gray-600"
                      />
                    )}
                  />
                  {errors.userId && (
                    <p className="text-red-400 text-xs mt-1">{errors.userId.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <label className="text-gray-400 text-sm font-medium block text-left">Password</label>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: 'Password is required'
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter Password"
                          className="w-full px-4 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage transition placeholder-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 18a9.936 9.936 0 008.515-4.757M9.172 5.104a4 4 0 015.724 5.724M2.485 7.757C1.732 9.014 1.262 10.456 1.262 12c0 4.418 3.582 8 8 8 1.544 0 2.986-.47 4.243-1.243m-7.243-8l2.828 2.829" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  />
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                  )}
                  <Link to="/forgot-password" className="text-gray-500 hover:text-sage text-xs font-medium transition inline-block mt-2">
                    Forgot password ?
                  </Link>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-10 bg-sage hover:bg-sage/90 text-gray-900 font-semibold rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Create Account Link */}
            <p className="text-center text-gray-400 text-sm mt-8">
              Don't have an account?{' '}
              <Link to="/signup" className="text-sage hover:text-sage/80 font-semibold transition">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
