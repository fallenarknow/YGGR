import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Clock, CheckCircle, Loader2, Globe, Target, AlertCircle } from 'lucide-react';
import { geolocationService, LocationData, getCurrentLocation, getLocationFromIP } from '../lib/geolocation';
import { locationDB } from '../lib/locationDatabase';
import { useAuth } from '../contexts/AuthContext';

interface GlobalLocationSelectorProps {
  onLocationSelect: (location: LocationData) => void;
  currentLocation?: LocationData | null;
  showSavedLocations?: boolean;
  allowManualEntry?: boolean;
  className?: string;
}

export const GlobalLocationSelector: React.FC<GlobalLocationSelectorProps> = ({
  onLocationSelect,
  currentLocation,
  showSavedLocations = true,
  allowManualEntry = true,
  className = ''
}) => {
  const { user } = useAuth();
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');

  useEffect(() => {
    checkLocationPermission();
    if (user && showSavedLocations) {
      loadSavedLocations();
    }
  }, [user, showSavedLocations]);

  const checkLocationPermission = async () => {
    const status = await geolocationService.requestLocationPermission();
    setPermissionStatus(status);
  };

  const loadSavedLocations = async () => {
    if (!user) return;
    
    try {
      const locations = await locationDB.getUserLocations(user.id);
      setSavedLocations(locations.map(loc => ({
        id: loc.id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        addressLine1: loc.addressLine1,
        addressLine2: loc.addressLine2,
        city: loc.city,
        state: loc.state,
        country: loc.country,
        postalCode: loc.postalCode,
        timezone: loc.timezone,
        type: loc.type,
        isPrimary: loc.isPrimary,
        isCurrent: loc.isCurrent
      })));
    } catch (error) {
      console.error('Failed to load saved locations:', error);
    }
  };

  const detectCurrentLocation = async () => {
    setIsDetecting(true);
    setError(null);
    
    try {
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        fallbackToIP: true
      });
      
      onLocationSelect(location);
      
      // Save location if user is logged in
      if (user) {
        try {
          await locationDB.saveUserLocation(user.id, {
            ...location,
            type: 'temporary',
            isCurrent: true
          });
          loadSavedLocations();
        } catch (saveError) {
          console.warn('Failed to save location:', saveError);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to detect location');
      
      // Try IP-based location as fallback
      try {
        const ipLocation = await getLocationFromIP();
        onLocationSelect(ipLocation);
        setError(null);
      } catch (ipError) {
        console.error('IP location fallback failed:', ipError);
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await geolocationService.forwardGeocode(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = async (location: LocationData) => {
    onLocationSelect(location);
    setSearchQuery('');
    setSearchResults([]);
    
    // Save as saved location if user is logged in
    if (user && location.city) {
      try {
        await locationDB.saveUserLocation(user.id, {
          ...location,
          type: 'home',
          isCurrent: true
        });
        loadSavedLocations();
      } catch (error) {
        console.warn('Failed to save location:', error);
      }
    }
  };

  const formatLocationDisplay = (location: LocationData): string => {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  };

  const getLocationIcon = (type?: string) => {
    switch (type) {
      case 'home': return '🏠';
      case 'work': return '🏢';
      case 'temporary': return '📍';
      default: return '📍';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-secondary-900 mb-2">
          Choose Your Location
        </h3>
        <p className="text-secondary-600 text-sm">
          Find plants and sellers near you anywhere in the world
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Auto-detect Location */}
      <button
        onClick={detectCurrentLocation}
        disabled={isDetecting}
        className="w-full mb-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isDetecting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Detecting location...</span>
          </>
        ) : (
          <>
            <Target className="h-5 w-5" />
            <span>Use Current Location</span>
          </>
        )}
      </button>

      {permissionStatus === 'denied' && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700">
          Location access denied. Please enable location services or search manually.
        </div>
      )}

      {allowManualEntry && (
        <>
          <div className="relative mb-4">
            <div className="text-center text-secondary-500 text-sm mb-4">or</div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for any city or address..."
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400 animate-spin" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-secondary-200 rounded-xl shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                {searchResults.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-secondary-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-secondary-900">
                          {formatLocationDisplay(location)}
                        </div>
                        {location.addressLine1 && (
                          <div className="text-sm text-secondary-600">{location.addressLine1}</div>
                        )}
                      </div>
                      <MapPin className="h-4 w-4 text-secondary-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Saved Locations */}
      {showSavedLocations && savedLocations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-secondary-700 mb-3">Saved Locations</h4>
          {savedLocations.slice(0, 3).map((location) => (
            <button
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 hover:border-primary-300 hover:bg-primary-50 ${
                currentLocation?.id === location.id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-secondary-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {getLocationIcon(location.type)}
                  </div>
                  <div>
                    <div className="font-medium text-secondary-900">
                      {formatLocationDisplay(location)}
                    </div>
                    {location.addressLine1 && (
                      <div className="text-sm text-secondary-600">{location.addressLine1}</div>
                    )}
                  </div>
                </div>
                {location.isCurrent && (
                  <div className="flex items-center space-x-1 text-sm text-primary-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Current</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Popular Global Cities */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-secondary-700 mb-3">Popular Cities</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
            { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
            { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
            { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
            { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
            { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 }
          ].map((city) => (
            <button
              key={`${city.name}-${city.country}`}
              onClick={() => handleLocationSelect({
                latitude: city.lat,
                longitude: city.lng,
                city: city.name,
                country: city.country,
                isCurrent: true
              })}
              className="p-3 text-left border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="font-medium text-secondary-900 text-sm">{city.name}</div>
              <div className="text-xs text-secondary-600">{city.country}</div>
            </button>
          ))}
        </div>
      </div>

      {currentLocation && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Selected: {formatLocationDisplay(currentLocation)}
            </span>
          </div>
          <div className="text-sm text-green-700 mt-1">
            Ready to find plants and sellers near you
          </div>
        </div>
      )}
    </div>
  );
};