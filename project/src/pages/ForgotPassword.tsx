import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send, AlertCircle, CheckCircle, Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send password reset email');
      }

      setSuccess(true);
      
      // For development, log the reset URL
      if (data.resetUrl) {
        console.log('Development reset URL:', data.resetUrl);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
            {/* Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              {success ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-800 mb-4">Check Your Email</h2>
                  <p className="text-green-700 mb-6">
                    If an account exists with the email you provided, we've sent instructions to reset your password.
                  </p>
                  <div className="text-sm text-green-600 mb-6">
                    <p>Didn't receive an email?</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Check your spam or junk folder</li>
                      <li>• Verify you entered the correct email</li>
                      <li>• Wait a few minutes for the email to arrive</li>
                    </ul>
                  </div>
                  <Link
                    to="/login"
                    className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                  >
                    Return to Login
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Forgot Password?</h2>
                    <p className="text-green-700">
                      Enter your email address and we'll send you instructions to reset your password.
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

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>Send Reset Instructions</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-green-700">
                      Remember your password?{' '}
                      <Link
                        to="/login"
                        className="font-medium text-green-600 hover:text-green-800 transition-colors"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};