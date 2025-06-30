import React, { useState } from 'react';
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LocationSelector } from '../components/LocationSelector';
import { LocalInventorySearch } from '../components/LocalInventorySearch';
import { Plant } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface MarketplaceProps {
  onAddToCart: (plant: Plant) => void;
  onViewPlantDetails: (plantId: string) => void;
  searchQuery: string;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  onAddToCart,
  onViewPlantDetails,
  searchQuery
}) => {
  const [userLocation, setUserLocation] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLocationSelect = (location: any) => {
    setUserLocation(location);
  };

  const handleReservation = (item: any) => {
    if (!user) {
      navigate('/login?redirect=marketplace');
      return;
    }
    
    console.log('Reservation requested:', item);
    alert('Pickup reservation confirmed! You will receive SMS confirmation shortly.');
  };

  const handleDelivery = (item: any) => {
    if (!user) {
      navigate('/login?redirect=marketplace');
      return;
    }

    console.log('Delivery requested:', item);
    alert('Delivery order confirmed! Your plant will be delivered within the estimated time.');
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
                <span className="text-secondary-900 font-medium">Local Plant Marketplace</span>
              </div>
            </div>

            {/* Location Indicator */}
            {userLocation && (
              <div className="flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{userLocation.name}, {userLocation.state}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {/* Step 1: Location Selection */}
        {!userLocation && (
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Choose Your Location</span>
              </div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                Find Plants Near You
              </h1>
              <p className="text-secondary-600">
                Discover local plants available for same-day pickup or delivery within 15km radius.
              </p>
            </div>
            
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              currentLocation={userLocation}
            />
          </div>
        )}

        {/* Step 2: Plant Catalog & Seller Details */}
        {userLocation && (
          <LocalInventorySearch
            userLocation={userLocation}
            onReserve={handleReservation}
            onDelivery={handleDelivery}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      {userLocation && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm text-secondary-600">
              <span className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{userLocation.name} • {userLocation.shopCount} local shops</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setUserLocation(null)}
                className="px-4 py-2 text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                Change Location
              </button>
              
              <div className="text-sm text-secondary-500">
                Same-day delivery within 15km
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};