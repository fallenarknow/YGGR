import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Mail, Lock, ArrowRight, AlertCircle, Store, User, Building, Phone, MapPin, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const SellerSignup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    email: '',
    phone: '',
    
    // Business Info
    business_name: '',
    business_type: '',
    business_address: '',
    business_description: '',
    
    // Account Security
    password: '',
    confirmPassword: '',
    
    // Agreements
    terms: false,
    marketing: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const businessTypes = [
    'Nursery',
    'Garden Center',
    'Plant Grower',
    'Landscape Designer',
    'Plant Retailer',
    'Greenhouse Operation',
    'Individual Seller',
    'Other'
  ];

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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.full_name.trim()) {
        newErrors.full_name = "Please enter your full name";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Please enter your email address";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Please enter your phone number";
      }
    }
    
    if (step === 2) {
      if (!formData.business_name.trim()) {
        newErrors.business_name = "Please enter your business name";
      }
      if (!formData.business_type) {
        newErrors.business_type = "Please select your business type";
      }
      if (!formData.business_address.trim()) {
        newErrors.business_address = "Please enter your business address";
      }
      if (!formData.business_description.trim()) {
        newErrors.business_description = "Please provide a business description";
      }
    }
    
    if (step === 3) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSocialSignUp = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/seller/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (error: any) {
      setErrors({ general: error.message || `${provider} sign up failed. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: 'dummy_password_for_check_only'
      });
      
      // If no error, user exists
      if (!checkError || checkError.message.includes('Invalid login credentials')) {
        // Check if it's an "invalid credentials" error (user exists but wrong password)
        if (!checkError) {
          throw new Error('An account with this email already exists. Please use a different email or try logging in.');
        }
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: 'seller',
            business_name: formData.business_name
          }
        }
      });

      if (authError) {
        // Check for duplicate user error
        if (authError.message?.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please use a different email or try logging in.');
        }
        throw authError;
      }

      if (authData.user) {
        // Wait for the database trigger to create the initial profile
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update the profile with seller-specific information
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            business_name: formData.business_name,
            business_type: formData.business_type,
            business_address: formData.business_address,
            business_description: formData.business_description,
            business_phone: formData.phone,
            business_verified: false,
            role: 'seller'
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          // Continue anyway since the basic profile was created
        }
      }

      navigate('/seller/login', { 
        state: { 
          message: 'Account created successfully! Please sign in to access your dashboard.' 
        }
      });
    } catch (error: any) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary-800">Personal Information</h2>
              <p className="text-primary-600">Tell us about yourself</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.full_name ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-white/50'
                }`}
                placeholder="John Smith"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Email Address *
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
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.phone ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-white/50'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Social Sign Up Options */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-primary-600">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => handleSocialSignUp('google')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-primary-300 rounded-xl bg-white text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => handleSocialSignUp('facebook')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center py-3 px-4 border border-primary-300 rounded-xl bg-white text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary-800">Business Information</h2>
              <p className="text-primary-600">Tell us about your business</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => handleInputChange('business_name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.business_name ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-white/50'
                }`}
                placeholder="Green Paradise Nursery"
              />
              {errors.business_name && (
                <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Business Type *
              </label>
              <select
                value={formData.business_type}
                onChange={(e) => handleInputChange('business_type', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.business_type ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-white/50'
                }`}
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.business_type && (
                <p className="mt-1 text-sm text-red-600">{errors.business_type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Business Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-primary-500" />
                <textarea
                  value={formData.business_address}
                  onChange={(e) => handleInputChange('business_address', e.target.value)}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.business_address ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-white/50'
                  }`}
                  placeholder="123 Garden Street, Portland, OR 97201"
                />
              </div>
              {errors.business_address && (
                <p className="mt-1 text-sm text-red-600">{errors.business_address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Business Description *
              </label>
              <textarea
                value={formData.business_description}
                onChange={(e) => handleInputChange('business_description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.business_description ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-white/50'
                }`}
                placeholder="Describe your business, specialties, and what makes you unique..."
              />
              {errors.business_description && (
                <p className="mt-1 text-sm text-red-600">{errors.business_description}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Lock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary-800">Account Security</h2>
              <p className="text-primary-600">Create a secure password</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Password *
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
                  placeholder="Create a strong password"
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
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-primary-600">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-primary-200 bg-white/50'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.checked)}
                  className="mt-1 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-primary-700">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-800 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-800 underline">
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
                  className="mt-1 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-primary-700">
                  I would like to receive marketing emails about new features and seller tips
                </span>
              </label>
            </div>

            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{errors.general}</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232D5016' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-primary-600 to-emerald-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-primary-800">YGGR</span>
                <p className="text-sm text-primary-600">Seller Registration</p>
              </div>
            </Link>
            <Link
              to="/seller/login"
              className="text-primary-700 hover:text-primary-800 font-medium text-sm transition-colors"
            >
              Already have an account?
            </Link>
          </div>
        </header>

        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto px-6 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-primary-200 text-primary-600'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all ${
                    currentStep > step ? 'bg-primary-600' : 'bg-primary-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-primary-600">
            <span>Personal</span>
            <span>Business</span>
            <span>Security</span>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <form onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-3 border border-primary-300 text-primary-700 rounded-xl hover:bg-primary-50 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-primary-600 to-emerald-600 text-white rounded-xl hover:from-primary-700 hover:to-emerald-700 transition-all font-medium flex items-center space-x-2"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-primary-600 to-emerald-600 text-white rounded-xl hover:from-primary-700 hover:to-emerald-700 transition-all font-medium flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <CheckCircle className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};