import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import * as authService from '../services/authService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [error, setError] = useState('');
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    let isMounted = true;
    const verifyEmailToken = async () => {
      if (!token) {
        setStatus('waiting');
        return;
      }

      const result = await authService.verifyEmail(token);
      if (isMounted) {
        if (result.success) {
          setStatus('success');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            if (isMounted) navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setError(result.error);
        }
      }
    };

    verifyEmailToken();

    // Cleanup to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <h2 className="text-gray-800 font-semibold mb-2">Verifying Your Email</h2>
          <p className="text-gray-600">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-sage rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">Your email has been successfully verified. You can now log in to your account.</p>
          <p className="text-sm text-gray-500 mb-6">Redirecting to login in a few seconds...</p>
          <Link to="/login" className="inline-block px-8 py-3 bg-sage hover:bg-sage/90 text-white font-semibold rounded-lg transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/signup" className="inline-block px-8 py-3 bg-sage hover:bg-sage/90 text-white font-semibold rounded-lg transition">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // Waiting for token or showing manual verification option
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Verify Your Email</h2>
          <p className="text-gray-600 mb-6">
            {email ? `We've sent a verification link to ${email}. Check your emails and click the link to verify your account.` : 'Verification link will be sent to your email address.'}
          </p>
          <Link to="/login" className="inline-block px-8 py-3 bg-sage hover:bg-sage/90 text-white font-semibold rounded-lg transition">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
