import React, { useState } from 'react';
import { ArrowLeft, MapPin, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import PlantPersonalityQuiz from '../components/PlantPersonalityQuiz';
import { LocationSelector } from '../components/LocationSelector';
import { LocalInventorySearch } from '../components/LocalInventorySearch';
import { ReservationSystem } from '../components/ReservationSystem';

export const PlantMatcher: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'location' | 'quiz' | 'inventory' | 'reservation' | 'delivery'>('location');
  const [userLocation, setUserLocation] = useState(null);
  const [recommendedPlants, setRecommendedPlants] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [actionType, setActionType] = useState<'pickup' | 'delivery'>('pickup');

  // Get the primary recommended plant (first in the list) for display purposes
  const primaryRecommendedPlant = recommendedPlants.length > 0 ? recommendedPlants[0] : null;

  const handleLocationSelect = (location: any) => {
    setUserLocation(location);
    setCurrentStep('quiz');
  };

  const handleQuizComplete = (plants: any[]) => {
    setRecommendedPlants(plants);
    setCurrentStep('inventory');
  };

  const handleReservation = (item: any) => {
    setSelectedItem(item);
    setActionType('pickup');
    setCurrentStep('reservation');
  };

  const handleDelivery = (item: any) => {
    setSelectedItem(item);
    setActionType('delivery');
    // For delivery, you might want to go to a different flow
    // For now, we'll use the same reservation system but with delivery context
    setCurrentStep('delivery');
  };

  const handleReservationConfirm = (reservationData: any) => {
    setReservation(reservationData);
    console.log('Reservation confirmed:', reservationData);
    
    if (actionType === 'pickup') {
      alert('Pickup reservation confirmed! You will receive SMS confirmation shortly.');
    } else {
      alert('Delivery order confirmed! Your plant will be delivered within the estimated time.');
    }
    
    setCurrentStep('inventory');
  };

  const handleReservationCancel = () => {
    setSelectedItem(null);
    setCurrentStep('inventory');
  };

  const handleDeliveryConfirm = (deliveryData: any) => {
    console.log('Delivery order confirmed:', deliveryData);
    alert('Delivery order confirmed! Your plant will be delivered within the estimated time.');
    setCurrentStep('inventory');
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
                <span className="text-secondary-900 font-medium">Plant Matcher</span>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              {['location', 'quiz', 'inventory'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step || (index === 0 && userLocation) || (index === 1 && recommendedPlants.length > 0) || (index === 2 && (currentStep === 'reservation' || currentStep === 'delivery'))
                      ? 'bg-primary-500 text-white' 
                      : 'bg-secondary-200 text-secondary-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`w-8 h-1 mx-2 ${
                      (index === 0 && userLocation) || (index === 1 && recommendedPlants.length > 0)
                        ? 'bg-primary-500' 
                        : 'bg-secondary-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {/* Step 1: Location Selection */}
        {currentStep === 'location' && (
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Step 1 of 3</span>
              </div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-4">
                Find Plants in Your City
              </h1>
              <p className="text-secondary-600">
                We focus on local delivery to ensure the highest quality plants reach you quickly and safely.
              </p>
            </div>
            
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              currentLocation={userLocation}
            />
          </div>
        )}

        {/* Step 2: Plant Personality Quiz */}
        {currentStep === 'quiz' && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-accent-100 text-accent-700 px-4 py-2 rounded-full mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Step 2 of 3</span>
              </div>
              {userLocation && (
                <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm mb-4">
                  <MapPin className="h-3 w-3" />
                  <span>{userLocation.name}, {userLocation.state}</span>
                </div>
              )}
            </div>
            
            <PlantPersonalityQuiz onComplete={handleQuizComplete} />
          </div>
        )}

        {/* Step 3: Local Inventory Search */}
        {currentStep === 'inventory' && (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
                <Search className="h-4 w-4" />
                <span className="font-medium">Step 3 of 3</span>
              </div>
              {recommendedPlants.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {recommendedPlants.map((plant, index) => (
                    <div key={index} className="inline-flex items-center space-x-2 bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm">
                      <Sparkles className="h-3 w-3" />
                      <span>{plant.name} ({plant.matchPercentage}% Match)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <LocalInventorySearch
              recommendedPlant={primaryRecommendedPlant}
              userLocation={userLocation}
              onReserve={handleReservation}
              onDelivery={handleDelivery}
            />
          </div>
        )}

        {/* Reservation System for Pickup */}
        {currentStep === 'reservation' && selectedItem && (
          <ReservationSystem
            item={selectedItem}
            onConfirm={handleReservationConfirm}
            onCancel={handleReservationCancel}
          />
        )}

        {/* Delivery System */}
        {currentStep === 'delivery' && selectedItem && (
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Delivery Order Confirmation
              </h2>
              
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Delivery Details</h3>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Plant:</strong> {selectedItem.plant.name}</p>
                  <p><strong>Shop:</strong> {selectedItem.shop.name}</p>
                  <p><strong>Price:</strong> ₹{selectedItem.price}</p>
                  <p><strong>Estimated Delivery:</strong> {selectedItem.shop.deliveryTime}</p>
                  <p><strong>Delivery Address:</strong> {userLocation?.name}, {userLocation?.state}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-green-900 mb-3">What's Included</h3>
                <ul className="space-y-1 text-green-800">
                  <li>• Same-day delivery within {selectedItem.shop.deliveryTime}</li>
                  <li>• Plant care instructions</li>
                  <li>• 7-day plant health guarantee</li>
                  <li>• Free follow-up care consultation</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleReservationCancel}
                  className="flex-1 px-6 py-3 border border-secondary-300 text-secondary-700 rounded-xl hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeliveryConfirm(selectedItem)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                >
                  Confirm Delivery Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      {currentStep !== 'location' && currentStep !== 'reservation' && currentStep !== 'delivery' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm text-secondary-600">
              {userLocation && (
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{userLocation.name}</span>
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {currentStep === 'quiz' && (
                <button
                  onClick={() => setCurrentStep('location')}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-900 transition-colors"
                >
                  Change Location
                </button>
              )}
              
              {currentStep === 'inventory' && (
                <button
                  onClick={() => setCurrentStep('quiz')}
                  className="px-4 py-2 text-secondary-600 hover:text-secondary-900 transition-colors"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};