import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Mail, Lock, ArrowRight, AlertCircle, Store, Shield } from 'lucide-react';
import { signIn } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const SellerLogin: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === 'seller') {
        const from = location.state?.from?.pathname || '/seller/dashboard';
        navigate(from, { replace: true });
      } else {
        signOut();
        setErrors({ general: 'This account is not registered as a seller.' });
        setIsLoading(false);
      }
    }
  }, [user, profile, authLoading, navigate, location.state, signOut]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    setErrors({});

    try {
      const { user } = await signIn(formData.email, formData.password);
      
      // Verify user is a seller by checking their profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        throw new Error('Failed to verify account type');
      }

      if (profile?.role !== 'seller') {
        // Sign out the user since they're not a seller
        await signOut();
        setErrors({ general: 'This account is not registered as a seller. Please use the regular login or register as a seller.' });
        setIsLoading(false);
        return;
      }

      // Don't navigate here - let the useEffect handle it after auth state is updated
    } catch (error: any) {
      setErrors({ general: error.message || 'Login failed. Please try again.' });
      setIsLoading(false);
    }
  };

  // Show loading state while authentication is being processed
  if (authLoading || (isLoading && !errors.general)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-700 font-medium">Verifying seller account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50 relative overflow-hidden">
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
            <Store className="h-6 w-6 text-primary-600" />
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-primary-600 to-emerald-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-primary-800">YGGR</span>
                <p className="text-sm text-primary-600">Seller Portal</p>
              </div>
            </Link>
            <Link
              to="/login"
              className="text-primary-700 hover:text-primary-800 font-medium text-sm transition-colors"
            >
              Customer Login
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-600 to-emerald-600 rounded-full mb-6 shadow-lg">
                <Store className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-primary-800 mb-2">Seller Portal</h1>
              <p className="text-primary-600 text-lg">Access your plant marketplace dashboard</p>
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
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-white/50'
                      }`}
                      placeholder="your.business@email.com"
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
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-white/50'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-700"
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
                      className="rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-primary-700">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || authLoading}
                  className="w-full bg-gradient-to-r from-primary-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-primary-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verifying account...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Dashboard</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-primary-700">
                  New seller?{' '}
                  <Link
                    to="/seller/signup"
                    className="font-medium text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    Register your business
                  </Link>
                </p>
              </div>
            </div>

            {/* Seller Benefits */}
            <div className="mt-8 bg-gradient-to-r from-primary-50 to-emerald-50 rounded-2xl p-6 border border-primary-200">
              <h3 className="font-semibold text-primary-800 mb-4 text-center flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Seller Benefits</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-primary-700">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span>Inventory management</span>
                </div>
                <div className="flex items-center space-x-2 text-primary-700">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span>Sales analytics</span>
                </div>
                <div className="flex items-center space-x-2 text-primary-700">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span>Customer management</span>
                </div>
                <div className="flex items-center space-x-2 text-primary-700">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span>Marketing tools</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};