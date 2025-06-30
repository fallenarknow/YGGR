import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Clock, CheckCircle } from 'lucide-react';

interface LocationSelectorProps {
  onLocationSelect: (location: any) => void;
  currentLocation?: any;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  onLocationSelect, 
  currentLocation 
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Mock cities for demo
  const availableCities = [
    { 
      id: 'bangalore', 
      name: 'Bangalore', 
      state: 'Karnataka',
      coords: { lat: 12.9716, lng: 77.5946 },
      shopCount: 47,
      deliveryRadius: '15km',
      avgDeliveryTime: '2-4 hours'
    },
    { 
      id: 'mumbai', 
      name: 'Mumbai', 
      state: 'Maharashtra',
      coords: { lat: 19.0760, lng: 72.8777 },
      shopCount: 62,
      deliveryRadius: '12km',
      avgDeliveryTime: '3-5 hours'
    },
    { 
      id: 'delhi', 
      name: 'Delhi', 
      state: 'Delhi',
      coords: { lat: 28.7041, lng: 77.1025 },
      shopCount: 38,
      deliveryRadius: '18km',
      avgDeliveryTime: '2-6 hours'
    },
    { 
      id: 'pune', 
      name: 'Pune', 
      state: 'Maharashtra',
      coords: { lat: 18.5204, lng: 73.8567 },
      shopCount: 29,
      deliveryRadius: '14km',
      avgDeliveryTime: '2-4 hours'
    }
  ];

  const detectLocation = async () => {
    setIsDetecting(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Mock: Find nearest city
          const nearestCity = availableCities[0]; // Bangalore for demo
          onLocationSelect({
            ...nearestCity,
            userCoords: { lat: latitude, lng: longitude },
            detected: true
          });
          setIsDetecting(false);
        },
        (error) => {
          console.error('Location detection failed:', error);
          setIsDetecting(false);
        }
      );
    } else {
      setIsDetecting(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const filtered = availableCities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-secondary-900 mb-2">
          Choose Your City
        </h3>
        <p className="text-secondary-600 text-sm">
          We deliver premium plants locally for the best quality
        </p>
      </div>

      {/* Auto-detect Location */}
      <button
        onClick={detectLocation}
        disabled={isDetecting}
        className="w-full mb-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        <Navigation className={`h-5 w-5 ${isDetecting ? 'animate-spin' : ''}`} />
        <span>{isDetecting ? 'Detecting...' : 'Use Current Location'}</span>
      </button>

      <div className="relative mb-4">
        <div className="text-center text-secondary-500 text-sm mb-4">or</div>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for your city..."
            className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-secondary-200 rounded-xl shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
            {suggestions.map((city) => (
              <button
                key={city.id}
                onClick={() => {
                  onLocationSelect(city);
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-secondary-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-secondary-900">{city.name}</div>
                    <div className="text-sm text-secondary-600">{city.state}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary-600">{city.shopCount} shops</div>
                    <div className="text-xs text-secondary-500">{city.avgDeliveryTime}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Available Cities */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-secondary-700 mb-3">Available Cities</h4>
        {availableCities.map((city) => (
          <button
            key={city.id}
            onClick={() => onLocationSelect(city)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 hover:border-primary-300 hover:bg-primary-50 ${
              currentLocation?.id === city.id 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-secondary-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-sm">
                    {city.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-secondary-900">{city.name}</div>
                  <div className="text-sm text-secondary-600">{city.state}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-sm text-primary-600 mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>{city.shopCount} shops</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-secondary-500">
                  <Clock className="h-3 w-3" />
                  <span>{city.avgDeliveryTime}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {currentLocation && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              Selected: {currentLocation.name}, {currentLocation.state}
            </span>
          </div>
          <div className="text-sm text-green-700 mt-1">
            {currentLocation.shopCount} local shops • {currentLocation.deliveryRadius} radius
          </div>
        </div>
      )}
    </div>
  );
};