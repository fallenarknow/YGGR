import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Shield, Heart, User } from 'lucide-react';
import { signUp } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';

export const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
    marketing: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading } = useAuth();
  
  // Handle redirection after successful authentication
  useEffect(() => {
    if (!authLoading && user && profile) {
      // Redirect to profile page to complete profile information
      navigate('/profile', { replace: true });
    }
  }, [user, profile, authLoading, navigate, location.state]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Please enter your full name";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Please enter a password";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.terms) {
      newErrors.terms = "Please accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Only pass minimal data to signUp function
      await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        role: 'buyer'
      });
      
      // Redirect to email verification page
      navigate('/verify-email', { 
        state: { 
          email: formData.email 
        } 
      });
    } catch (error: any) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
      setIsLoading(false);
    }
  };

  // Show loading state while authentication is being processed
  if (authLoading || (isLoading && !errors.general)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Creating your account...</p>
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
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-green-800">YGGR</span>
                <p className="text-sm text-green-600">Join the Community</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-green-700 hover:text-green-800 font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/seller/signup"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Sell Plants
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-6 shadow-lg">
                <Heart className="h-10 w-10 text-white animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">Join YGGR Community!</h1>
              <p className="text-green-600 text-lg">Start your plant journey with personalized recommendations</p>
            </div>

            {/* Signup Form Card */}
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
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          errors.full_name ? 'border-red-300 bg-red-50' : 'border-green-200 bg-white/50'
                        }`}
                        placeholder="Your full name"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.full_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Email Address *
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
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Password *
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
                        placeholder="Create a password"
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

                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-green-200 bg-white/50'
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms and Marketing */}
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.terms}
                      onChange={(e) => handleInputChange('terms', e.target.checked)}
                      className="mt-1 rounded border-green-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-green-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-green-600 hover:text-green-800 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-green-600 hover:text-green-800 underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-sm text-red-600">{errors.terms}</p>
                  )}

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.marketing}
                      onChange={(e) => handleInputChange('marketing', e.target.checked)}
                      className="mt-1 rounded border-green-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-green-700">
                      I would like to receive plant care tips and community updates
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating your account...</span>
                    </>
                  ) : (
                    <>
                      <span>Join YGGR Community</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-8 text-center">
                <p className="text-green-700">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-green-600 hover:text-green-800 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            {/* Seller CTA */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 text-center">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Want to sell plants?</span>
              </h3>
              <p className="text-green-700 mb-4">
                Join our marketplace as a verified seller and reach thousands of plant enthusiasts
              </p>
              <Link
                to="/seller/signup"
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                <span>Register as Seller</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Community Benefits */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-4 text-center">
                What you'll get as a YGGR member
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
                  <span>Plant community access</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};