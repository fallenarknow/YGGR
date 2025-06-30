import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowLeft, AlertCircle, CheckCircle, Leaf, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query parameters
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    
    if (!tokenParam) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    } else {
      setToken(tokenParam);
    }
  }, [location]);

  useEffect(() => {
    // Simple password strength checker
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return { label: 'Very Weak', color: 'bg-red-500', width: '25%' };
      case 1: return { label: 'Weak', color: 'bg-orange-500', width: '25%' };
      case 2: return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
      case 3: return { label: 'Good', color: 'bg-blue-500', width: '75%' };
      case 4: return { label: 'Strong', color: 'bg-green-500', width: '100%' };
      default: return { label: 'Very Weak', color: 'bg-red-500', width: '25%' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const strengthInfo = getStrengthLabel();

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
            {/* Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              {success ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 mb-4">Password Reset Successful</h2>
                  <p className="text-green-700 mb-6">
                    Your password has been reset successfully. You will be redirected to the login page shortly.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                  >
                    Go to Login
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Reset Your Password</h2>
                    <p className="text-green-700">
                      Create a new password for your account
                    </p>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-800">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  {!token && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Invalid or missing reset token. Please request a new password reset link.
                        </span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50"
                          placeholder="Create a new password"
                          required
                          disabled={!token}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-green-700">Password Strength</span>
                            <span className="text-xs font-medium text-green-700">{strengthInfo.label}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${strengthInfo.color} h-2 rounded-full transition-all duration-300`} 
                              style={{ width: strengthInfo.width }}
                            ></div>
                          </div>
                          <div className="mt-1 text-xs text-green-600">
                            <ul className="space-y-1">
                              <li className={`flex items-center space-x-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                                <span>{password.length >= 8 ? '✓' : '○'}</span>
                                <span>At least 8 characters</span>
                              </li>
                              <li className={`flex items-center space-x-1 ${password.match(/[A-Z]/) ? 'text-green-600' : 'text-gray-400'}`}>
                                <span>{password.match(/[A-Z]/) ? '✓' : '○'}</span>
                                <span>At least one uppercase letter</span>
                              </li>
                              <li className={`flex items-center space-x-1 ${password.match(/[0-9]/) ? 'text-green-600' : 'text-gray-400'}`}>
                                <span>{password.match(/[0-9]/) ? '✓' : '○'}</span>
                                <span>At least one number</span>
                              </li>
                              <li className={`flex items-center space-x-1 ${password.match(/[^A-Za-z0-9]/) ? 'text-green-600' : 'text-gray-400'}`}>
                                <span>{password.match(/[^A-Za-z0-9]/) ? '✓' : '○'}</span>
                                <span>At least one special character</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50"
                          placeholder="Confirm your new password"
                          required
                          disabled={!token}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {password && confirmPassword && password !== confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !token}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Resetting Password...</span>
                        </>
                      ) : (
                        <>
                          <span>Reset Password</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-green-600 flex items-center justify-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Your data is secure and protected</span>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};