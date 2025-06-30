import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Edit,
  Save,
  X,
  Camera,
  MapPin,
  Home,
  Leaf,
  Heart,
  Settings,
  Mail,
  Phone,
  Calendar,
  Award,
  Sparkles,
  CheckCircle,
  Plus,
  Globe,
  Shield,
  Bell,
  ShoppingBag,
  Upload,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<{
    id: string;
    full_name: string;
    living_situation: string;
    plant_preferences: string;
    available_space: string;
    role: string;
    avatar_url?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, living_situation, plant_preferences, available_space, role, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setProfile(data);
        
        // Check if this is a new user who needs to complete their profile
        const isProfileIncomplete = !data.living_situation && !data.plant_preferences && !data.available_space;
        setIsNewUser(isProfileIncomplete);
        
        // Automatically open edit mode for new users
        if (isProfileIncomplete) {
          setIsEditing(true);
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        living_situation: profile.living_situation,
        plant_preferences: profile.plant_preferences,
        available_space: profile.available_space,
      })
      .eq('id', user.id);

    if (error) {
      alert(error.message);
    } else {
      setIsEditing(false);
      setIsNewUser(false);
      refreshProfile();
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setUploadError(null);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      refreshProfile();
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-600 font-medium">Loading your plant journey...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Profile Not Found</h2>
          <p className="text-secondary-600">We couldn't find your profile information.</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlantPersonality = (preferences: string) => {
    if (!preferences) return 'Plant Explorer';
    const lower = preferences.toLowerCase();
    if (lower.includes('succulent') || lower.includes('cactus')) return 'Desert Enthusiast';
    if (lower.includes('tropical') || lower.includes('monstera')) return 'Jungle Creator';
    if (lower.includes('herb') || lower.includes('basil')) return 'Garden Chef';
    if (lower.includes('flower') || lower.includes('bloom')) return 'Bloom Collector';
    return 'Plant Enthusiast';
  };

  const getSpaceIcon = (space: string) => {
    if (!space) return <Home className="h-5 w-5" />;
    const lower = space.toLowerCase();
    if (lower.includes('apartment') || lower.includes('small')) return <Home className="h-5 w-5" />;
    if (lower.includes('house') || lower.includes('large')) return <Globe className="h-5 w-5" />;
    if (lower.includes('balcony') || lower.includes('patio')) return <MapPin className="h-5 w-5" />;
    return <Home className="h-5 w-5" />;
  };

  const getPersonalizedTips = () => {
    const livingSpace = profile.living_situation?.toLowerCase() || '';
    const availableSpace = profile.available_space?.toLowerCase() || '';
    const preferences = profile.plant_preferences?.toLowerCase() || '';

    let spaceRecommendation = 'Consider plants that match your space and lighting conditions.';
    
    if (livingSpace.includes('apartment') || availableSpace.includes('small') || availableSpace.includes('windowsill')) {
      spaceRecommendation = 'Perfect for compact plants like Snake Plants, Pothos, or small succulents that thrive in limited space.';
    } else if (livingSpace.includes('house') || availableSpace.includes('large') || availableSpace.includes('garden')) {
      spaceRecommendation = 'You have great space for larger plants like Fiddle Leaf Figs, Monstera, or even a small indoor tree!';
    } else if (availableSpace.includes('balcony') || availableSpace.includes('patio')) {
      spaceRecommendation = 'Outdoor space is perfect for herbs, flowering plants, and plants that enjoy fresh air and natural light.';
    }

    return spaceRecommendation;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          >
            <Leaf className="h-8 w-8 text-primary-500" />
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New User Welcome Banner */}
        {isNewUser && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Welcome to YGGR!</h2>
                <p className="opacity-90">Complete your profile to get personalized plant recommendations and care tips.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="flex-1 bg-white/20 h-2 rounded-full">
                <div className="bg-white h-2 rounded-full w-1/3"></div>
              </div>
              <span className="ml-4 text-sm font-medium">Step 1 of 3</span>
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="relative h-48 bg-gradient-to-r from-primary-500 via-primary-600 to-emerald-600">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
            
            {/* Floating Plant Icons */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                <Leaf className="h-6 w-6 text-white/30" />
              </div>
            ))}
          </div>

          {/* Profile Info */}
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-2xl border-4 border-white flex items-center justify-center group hover:scale-105 transition-transform duration-300 overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary-600">
                      {getInitials(profile.full_name || 'User')}
                    </span>
                  )}
                </div>
                
                {/* Avatar Upload Button */}
                <div className="absolute -bottom-2 -right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isUploadingAvatar}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`w-10 h-10 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors cursor-pointer group ${
                      isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    )}
                  </label>
                </div>

                {/* Upload Error */}
                {uploadError && (
                  <div className="absolute top-full left-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              {isEditing ? (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
                  >
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white border-2 border-secondary-300 text-secondary-700 px-6 py-3 rounded-2xl font-medium hover:border-secondary-400 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-secondary-900 mb-2">
                  {profile.full_name || 'Plant Enthusiast'}
                </h1>
                <div className="flex items-center space-x-4 text-secondary-600">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary-500" />
                    <span className="font-medium text-primary-600">{getPlantPersonality(profile.plant_preferences)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                  {profile.role && (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="capitalize font-medium text-green-600">{profile.role}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-4 border border-primary-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
                      <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-700">12</div>
                      <div className="text-sm text-primary-600">Plants Owned</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">98%</div>
                      <div className="text-sm text-green-600">Survival Rate</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-700">6</div>
                      <div className="text-sm text-purple-600">Months Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-800 flex items-center space-x-2">
                <User className="h-5 w-5 text-primary-500" />
                <span>Personal Details</span>
              </h3>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="bg-secondary-50 rounded-2xl p-4 border border-secondary-200 group-hover:border-primary-300 transition-colors">
                      <p className="text-secondary-900 font-medium">
                        {profile.full_name || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-secondary-700 mb-3 flex items-center space-x-2">
                    <Home className="h-4 w-4 text-primary-500" />
                    <span>Living Situation</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.living_situation || ''}
                      onChange={(e) => setProfile({ ...profile, living_situation: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="e.g., Apartment, House, Studio"
                    />
                  ) : (
                    <div className="bg-secondary-50 rounded-2xl p-4 border border-secondary-200 group-hover:border-primary-300 transition-colors">
                      <p className="text-secondary-900 font-medium">
                        {profile.living_situation || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Plant Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-800 flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-green-500" />
                <span>Plant Journey</span>
              </h3>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-secondary-700 mb-3 flex items-center space-x-2">
                    {getSpaceIcon(profile.available_space)}
                    <span>Available Space</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.available_space || ''}
                      onChange={(e) => setProfile({ ...profile, available_space: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      placeholder="e.g., Balcony, Indoor windowsill, Large garden"
                    />
                  ) : (
                    <div className="bg-secondary-50 rounded-2xl p-4 border border-secondary-200 group-hover:border-primary-300 transition-colors">
                      <p className="text-secondary-900 font-medium">
                        {profile.available_space || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-secondary-700 mb-3 flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Plant Preferences</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profile.plant_preferences || ''}
                      onChange={(e) => setProfile({ ...profile, plant_preferences: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-secondary-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none"
                      placeholder="Tell us about your favorite plants, care preferences, and plant goals..."
                    />
                  ) : (
                    <div className="bg-secondary-50 rounded-2xl p-4 border border-secondary-200 group-hover:border-primary-300 transition-colors">
                      <p className="text-secondary-900 leading-relaxed">
                        {profile.plant_preferences || 'No preferences specified yet. Share your plant journey with us!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Complete Profile CTA for new users */}
          {isNewUser && !isEditing && (
            <div className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary-800 mb-1">Complete Your Profile</h3>
                  <p className="text-primary-700">Tell us more about your plant preferences to get personalized recommendations</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-primary-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Personalized Plant Tips Section */}
          {!isEditing && (
            <div className="mt-12 pt-8 border-t border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-800 mb-6 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span>Personalized Plant Tips</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-blue-900 mb-2">Perfect for Your Space</h4>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    {getPersonalizedTips()}
                  </p>
                </div>

                <Link 
                  to="/care-reminders"
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center justify-between">
                    Care Reminders
                    <CheckCircle className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-green-700 text-sm leading-relaxed">
                    Set up watering reminders and get personalized care tips delivered to your inbox.
                  </p>
                </Link>

                <Link 
                  to="/marketplace"
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center justify-between">
                    Expand Collection
                    <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    Discover new plants that match your preferences and growing experience.
                  </p>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};