import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  Save, 
  Leaf,
  Droplets,
  Sun,
  Scissors,
  CheckCircle,
  Plus,
  X,
  Settings
} from 'lucide-react';

interface ReminderSettings {
  watering: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    time: string;
    days: string[];
  };
  fertilizing: {
    enabled: boolean;
    frequency: 'weekly' | 'monthly' | 'seasonal';
    time: string;
  };
  pruning: {
    enabled: boolean;
    frequency: 'monthly' | 'seasonal' | 'yearly';
  };
  repotting: {
    enabled: boolean;
    frequency: 'yearly' | 'biannual';
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export const CareRemindersSettings: React.FC = () => {
  const [settings, setSettings] = useState<ReminderSettings>({
    watering: {
      enabled: true,
      frequency: 'weekly',
      time: '09:00',
      days: ['monday', 'wednesday', 'friday']
    },
    fertilizing: {
      enabled: false,
      frequency: 'monthly',
      time: '10:00'
    },
    pruning: {
      enabled: false,
      frequency: 'monthly'
    },
    repotting: {
      enabled: false,
      frequency: 'yearly'
    },
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const daysOfWeek = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setSaveSuccess(true);
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateSettings = (category: keyof ReminderSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const toggleDay = (day: string) => {
    const currentDays = settings.watering.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    updateSettings('watering', 'days', newDays);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Profile</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-secondary-900">Care Reminders</h1>
              <p className="text-secondary-600 text-lg">Never forget to care for your plants again</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3 animate-fade-in">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-green-800 font-medium">Reminder settings saved successfully!</span>
          </div>
        )}

        {/* Main Settings */}
        <div className="space-y-8">
          {/* Watering Reminders */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">Watering Reminders</h3>
                  <p className="text-secondary-600">Get notified when it's time to water your plants</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.watering.enabled}
                  onChange={(e) => updateSettings('watering', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {settings.watering.enabled && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-3">
                      Frequency
                    </label>
                    <select
                      value={settings.watering.frequency}
                      onChange={(e) => updateSettings('watering', 'frequency', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-3">
                      Time
                    </label>
                    <input
                      type="time"
                      value={settings.watering.time}
                      onChange={(e) => updateSettings('watering', 'time', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {settings.watering.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-3">
                      Days of the Week
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day.key}
                          onClick={() => toggleDay(day.key)}
                          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                            settings.watering.days.includes(day.key)
                              ? 'bg-primary-500 text-white'
                              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fertilizing Reminders */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                  <Sun className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">Fertilizing Reminders</h3>
                  <p className="text-secondary-600">Stay on top of your plant nutrition schedule</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.fertilizing.enabled}
                  onChange={(e) => updateSettings('fertilizing', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {settings.fertilizing.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Frequency
                  </label>
                  <select
                    value={settings.fertilizing.frequency}
                    onChange={(e) => updateSettings('fertilizing', 'frequency', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Time
                  </label>
                  <input
                    type="time"
                    value={settings.fertilizing.time}
                    onChange={(e) => updateSettings('fertilizing', 'time', e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Other Care Reminders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pruning */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Scissors className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary-900">Pruning</h4>
                    <p className="text-sm text-secondary-600">Trim and shape reminders</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pruning.enabled}
                    onChange={(e) => updateSettings('pruning', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {settings.pruning.enabled && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={settings.pruning.frequency}
                    onChange={(e) => updateSettings('pruning', 'frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>

            {/* Repotting */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary-900">Repotting</h4>
                    <p className="text-sm text-secondary-600">Fresh soil reminders</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.repotting.enabled}
                    onChange={(e) => updateSettings('repotting', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {settings.repotting.enabled && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={settings.repotting.frequency}
                    onChange={(e) => updateSettings('repotting', 'frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="yearly">Yearly</option>
                    <option value="biannual">Every 2 Years</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-900">Notification Preferences</h3>
                <p className="text-secondary-600">Choose how you'd like to receive reminders</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <Mail className="h-6 w-6 text-secondary-600" />
                  <span className="font-medium text-secondary-900">Email</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => updateSettings('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <Bell className="h-6 w-6 text-secondary-600" />
                  <span className="font-medium text-secondary-900">Push</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => updateSettings('notifications', 'push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <Phone className="h-6 w-6 text-secondary-600" />
                  <span className="font-medium text-secondary-900">SMS</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => updateSettings('notifications', 'sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-12 py-4 rounded-2xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 flex items-center space-x-3 shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-6 w-6" />
                  <span>Save Reminder Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};