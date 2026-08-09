import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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

                {/* Email Address Field */}
                <div className="space-y-2 mb-5">
                  <label className="text-gray-400 text-xs font-medium block text-left">Email Address</label>
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition focus:outline-none"
                          title={showPassword ? "Hide Password" : "Show Password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
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
