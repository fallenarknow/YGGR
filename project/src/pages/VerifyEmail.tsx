import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const VerifyEmail: React.FC = () => {
  const { user, emailConfirmed, resendConfirmationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = user?.email || location.state?.email || '';
  
  // Redirect if email is already confirmed
  useEffect(() => {
    if (emailConfirmed) {
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    }
  }, [emailConfirmed, navigate, location.state]);
  
  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email || isResending || countdown > 0) return;
    
    setIsResending(true);
    setResendError(null);
    
    try {
      await resendConfirmationEmail(email);
      setResendSuccess(true);
      setCountdown(60); // Set a 60-second countdown before allowing another resend
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendError(error.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232D5016' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          >
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-green-800">YGGR</span>
                <p className="text-sm text-green-600">the plant Hub</p>
              </div>
            </Link>
            <Link
              to="/login"
              className="text-green-700 hover:text-green-800 font-medium text-sm transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">Verify Your Email</h2>
                <p className="text-green-700">
                  We've sent a verification link to <span className="font-medium">{email}</span>
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-green-800 mb-3">Next steps:</h3>
                <ol className="space-y-3 text-green-700">
                  <li className="flex items-start space-x-2">
                    <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span>Check your email inbox for the verification link</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span>Click the link in the email to verify your account</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span>Return to YGGR to continue your plant journey</span>
                  </li>
                </ol>
              </div>

              {resendError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{resendError}</span>
                  </div>
                </div>
              )}

              {resendSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Verification email resent successfully!</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || countdown > 0}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Mail className="h-5 w-5" />
                      <span>Resend in {countdown}s</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-green-700 text-sm">
                    Already verified?{' '}
                    <Link
                      to="/login"
                      className="font-medium text-green-600 hover:text-green-800 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-4 text-center">
                Can't find the email?
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-800" />
                  </div>
                  <span>Check your spam or junk folder</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-800" />
                  </div>
                  <span>Make sure you entered the correct email address</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-3 w-3 text-green-800" />
                  </div>
                  <span>Try clicking the resend button above</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};