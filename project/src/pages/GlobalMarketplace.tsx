import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Globe, Filter, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalLocationSelector } from '../components/GlobalLocationSelector';
import { ProximityBasedPlantSearch } from '../components/ProximityBasedPlantSearch';
import { LocationData } from '../lib/geolocation';
import { Plant } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface GlobalMarketplaceProps {
  onAddToCart: (plant: Plant) => void;
  onViewPlantDetails: (plantId: string) => void;
  searchQuery?: string;
}

export const GlobalMarketplace: React.FC<GlobalMarketplaceProps> = ({
  onAddToCart,
  onViewPlantDetails,
  searchQuery = ''
}) => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLocationSelect = (location: LocationData) => {
    setUserLocation(location);
    setShowLocationSelector(false);
  };

  const handlePlantSelect = (plant: Plant) => {
    navigate(`/plant/${plant.id}`);
  };

  const handleChangeLocation = () => {
    setShowLocationSelector(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-2 text-secondary-400">
                <span>/</span>
                <span className="text-secondary-900 font-medium">Global Plant Marketplace</span>
              </div>
            </div>

            {/* Location Indicator */}
            {userLocation && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">
                    {userLocation.city}, {userLocation.country}
                  </span>
                </div>
                <button
                  onClick={handleChangeLocation}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {/* Step 1: Location Selection */}
        {showLocationSelector && (
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
                <Globe className="h-4 w-4" />
                <span className="font-medium">Global Plant Discovery</span>
              </div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                Find Plants Anywhere
              </h1>
              <p className="text-secondary-600">
                Discover plants from local sellers worldwide with real-time location-based matching
              </p>
            </div>
            
            <GlobalLocationSelector
              onLocationSelect={handleLocationSelect}
              currentLocation={userLocation}
              showSavedLocations={!!user}
              allowManualEntry={true}
            />
          </div>
        )}

        {/* Step 2: Proximity-Based Plant Search */}
        {!showLocationSelector && userLocation && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProximityBasedPlantSearch
              userLocation={userLocation}
              onPlantSelect={handlePlantSelect}
              onAddToCart={onAddToCart}
              searchQuery={searchQuery}
              maxDistance={50}
            />
          </div>
        )}
      </div>

      {/* Global Features Banner */}
      {!showLocationSelector && userLocation && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Global Plant Network</h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Connect with plant sellers worldwide through our intelligent location-based platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Worldwide Coverage</h3>
                <p className="opacity-80">
                  Access plant sellers from every continent with real-time location tracking
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Proximity Matching</h3>
                <p className="opacity-80">
                  Find the closest sellers with intelligent distance-based recommendations
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Personalized Discovery</h3>
                <p className="opacity-80">
                  Get location-aware recommendations based on your preferences and local climate
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {userLocation && !showLocationSelector && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm text-secondary-600">
              <span className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>
                  Searching in {userLocation.city}, {userLocation.country}
                </span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleChangeLocation}
                className="px-4 py-2 text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                Change Location
              </button>
              
              <div className="text-sm text-secondary-500">
                Real-time proximity matching enabled
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};