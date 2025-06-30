import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Shield, Heart } from 'lucide-react';
import { signIn } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading, emailConfirmed } = useAuth();
  
  // Handle redirection after successful authentication
  useEffect(() => {
    if (!authLoading && user && profile) {
      // Check if email is confirmed
      if (emailConfirmed === false) {
        navigate('/verify-email', { state: { email: user.email } });
        return;
      }
      
      // Get the intended destination from location state, or default to profile
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    }
  }, [user, profile, authLoading, emailConfirmed, navigate, location.state]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Please enter your password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await signIn(formData.email, formData.password);
      // Don't navigate here - let the useEffect handle it after auth state is updated
    } catch (error: any) {
      setErrors({ general: error.message || 'Login failed. Please try again.' });
      setIsLoading(false);
    }
  };

  // Show loading state while authentication is being processed
  if (authLoading || (isLoading && !errors.general)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Signing you in...</p>
        </div>
      </div>
    );
  }

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
              to="/signup"
              className="text-green-700 hover:text-green-800 font-medium text-sm transition-colors"
            >
              New here?
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Welcome Back Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-6 shadow-lg">
                <Heart className="h-10 w-10 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">Welcome back!</h1>
              <p className="text-green-600 text-lg">Ready to continue your plant journey?</p>
            </div>

            {/* Login Form Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{errors.general}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-green-200 bg-white/50'
                      }`}
                      placeholder="your@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-green-200 bg-white/50'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      className="rounded border-green-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-green-700">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Signing you in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Login */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-green-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-green-600">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="w-full inline-flex justify-center py-3 px-4 border border-green-300 rounded-xl bg-white text-sm font-medium text-green-700 hover:bg-green-50 transition-colors">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>
                  
                  <button className="w-full inline-flex justify-center py-3 px-4 border border-green-300 rounded-xl bg-white text-sm font-medium text-green-700 hover:bg-green-50 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-green-700">
                  New to YGGR?{' '}
                  <Link
                    to="/signup"
                    className="font-medium text-green-600 hover:text-green-800 transition-colors"
                  >
                    Join our community
                  </Link>
                </p>
              </div>
            </div>

            {/* App Benefits Preview */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-4 text-center">
                What awaits you in YGGR
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Personalized plant matches</span>
                </div>
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Local store connections</span>
                </div>
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Expert care guidance</span>
                </div>
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Plant community</span>
                </div>
              </div>
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