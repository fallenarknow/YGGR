import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, Phone, Navigation, Clock, ShoppingCart, Calendar, MessageCircle, Truck, Package, Heart, Share2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Plant } from '../types';

interface PlantSellerDetailsProps {
  plant: Plant;
  onBack: () => void;
  onReserve: (seller: any) => void;
  onDelivery: (seller: any) => void;
  userLocation?: any;
}

export const PlantSellerDetails: React.FC<PlantSellerDetailsProps> = ({
  plant,
  onBack,
  onReserve,
  onDelivery,
  userLocation
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Mock sellers data with varying distances and pricing
  const mockSellers = [
    {
      id: 'seller1',
      name: 'Green Paradise Nursery',
      address: 'Koramangala, Bangalore',
      distance: 2.3,
      rating: 4.8,
      reviewCount: 127,
      deliveryTime: '2-3 hours',
      phone: '+91 98765 43210',
      image: 'https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['Indoor Plants', 'Succulents', 'Air Purifying'],
      verified: true,
      price: plant.price,
      stock: 8,
      size: 'Medium (8" pot)',
      condition: 'Excellent',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'seller2',
      name: 'Urban Jungle Co.',
      address: 'Indiranagar, Bangalore',
      distance: 12.1,
      rating: 4.6,
      reviewCount: 89,
      deliveryTime: '3-4 hours',
      phone: '+91 98765 43211',
      image: 'https://images.pexels.com/photos/7081624/pexels-photo-7081624.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['Rare Plants', 'Planters', 'Plant Care'],
      verified: true,
      price: plant.price + 100,
      stock: 3,
      size: 'Large (10" pot)',
      condition: 'Excellent',
      lastUpdated: '4 hours ago'
    },
    {
      id: 'seller3',
      name: 'Bloom & Grow',
      address: 'HSR Layout, Bangalore',
      distance: 18.8,
      rating: 4.7,
      reviewCount: 156,
      deliveryTime: 'Pickup only',
      phone: '+91 98765 43212',
      image: 'https://images.pexels.com/photos/6912796/pexels-photo-6912796.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['Flowering Plants', 'Garden Design', 'Organic'],
      verified: false,
      price: plant.price - 50,
      stock: 12,
      size: 'Small (6" pot)',
      condition: 'Good',
      lastUpdated: '1 day ago'
    },
    {
      id: 'seller4',
      name: 'Plant Paradise',
      address: 'Whitefield, Bangalore',
      distance: 22.5,
      rating: 4.5,
      reviewCount: 98,
      deliveryTime: 'Pickup only',
      phone: '+91 98765 43213',
      image: 'https://images.pexels.com/photos/7689734/pexels-photo-7689734.jpeg?auto=compress&cs=tinysrgb&w=200',
      specialties: ['Succulents', 'Cacti', 'Desert Plants'],
      verified: true,
      price: plant.price + 200,
      stock: 5,
      size: 'Extra Large (12" pot)',
      condition: 'Premium',
      lastUpdated: '6 hours ago'
    }
  ];

  // Sort sellers by distance
  const sortedSellers = mockSellers.sort((a, b) => a.distance - b.distance);

  // Check if seller is within delivery range (15km)
  const isWithinDeliveryRange = (distance: number) => distance <= 15;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: plant.name,
        text: `Check out this ${plant.name} available from local sellers!`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Plants</span>
        </button>
        
        {userLocation && (
          <div className="flex items-center space-x-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
            <MapPin className="h-4 w-4" />
            <span>{userLocation.name}, {userLocation.state}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Plant Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-secondary-100 rounded-2xl overflow-hidden">
            <img
              src={plant.images[selectedImageIndex]}
              alt={plant.name}
              className="w-full h-full object-cover"
            />
          </div>
          {plant.images.length > 1 && (
            <div className="flex space-x-2">
              {plant.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? 'border-primary-500' : 'border-secondary-200'
                  }`}
                >
                  <img src={image} alt={`${plant.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Plant Info */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">{plant.name}</h1>
              <p className="text-lg text-secondary-600 italic mb-4">{plant.botanical_name}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {plant.pet_safe && (
                  <span className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm flex items-center space-x-1">
                    <span>🐾</span>
                    <span>Pet Safe</span>
                  </span>
                )}
                {plant.special_features?.map(feature => (
                  <span key={feature} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-lg transition-colors ${
                  isLiked ? 'bg-error-500 text-white' : 'bg-secondary-100 text-secondary-600 hover:text-error-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-secondary-100 text-secondary-600 rounded-lg hover:text-primary-600 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-secondary-900 mb-2">About this plant</h3>
            <p className="text-secondary-700 leading-relaxed">{plant.description}</p>
          </div>

          {/* Care Requirements */}
          <div>
            <h3 className="font-semibold text-secondary-900 mb-3">Care Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="font-medium text-secondary-900 mb-1">Care Level</div>
                <div className="text-secondary-600">{plant.care_level}/5 difficulty</div>
              </div>
              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="font-medium text-secondary-900 mb-1">Light</div>
                <div className="text-secondary-600 capitalize">{plant.light_requirement}</div>
              </div>
              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="font-medium text-secondary-900 mb-1">Watering</div>
                <div className="text-secondary-600 capitalize">{plant.watering_frequency}</div>
              </div>
              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="font-medium text-secondary-900 mb-1">Size</div>
                <div className="text-secondary-600 capitalize">{plant.size}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Delivery Policy:</span>
          </div>
          <span className="text-blue-700">
            Same-day delivery available within 15km • Pickup available for all locations
          </span>
        </div>
      </div>

      {/* Sellers Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-secondary-900">
            Available from {sortedSellers.length} Local Sellers
          </h2>
          <div className="text-sm text-secondary-600">
            Sorted by distance
          </div>
        </div>

        {sortedSellers.map((seller) => {
          const withinDeliveryRange = isWithinDeliveryRange(seller.distance);
          
          return (
            <div key={seller.id} className="bg-white rounded-2xl shadow-lg border border-secondary-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
                  {/* Seller Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center overflow-hidden">
                          <img
                            src={seller.image}
                            alt={seller.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-secondary-900">{seller.name}</h3>
                            {seller.verified && (
                              <span className="text-green-500 text-sm">✓ Verified</span>
                            )}
                          </div>
                          <p className="text-secondary-600">{seller.address}</p>
                          <div className="flex items-center space-x-4 text-sm text-secondary-600 mt-2">
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{seller.distance}km away</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{seller.rating} ({seller.reviewCount})</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{seller.deliveryTime}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Plant Details from this Seller */}
                    <div className="bg-secondary-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-secondary-900 mb-3">Plant Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-secondary-700">Size:</span>
                          <span className="text-secondary-600 ml-2">{seller.size}</span>
                        </div>
                        <div>
                          <span className="font-medium text-secondary-700">Condition:</span>
                          <span className="text-secondary-600 ml-2">{seller.condition}</span>
                        </div>
                        <div>
                          <span className="font-medium text-secondary-700">Stock:</span>
                          <span className="text-secondary-600 ml-2">{seller.stock} available</span>
                        </div>
                        <div>
                          <span className="font-medium text-secondary-700">Updated:</span>
                          <span className="text-secondary-600 ml-2">{seller.lastUpdated}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery/Pickup Options */}
                    <div className="bg-secondary-50 rounded-lg p-3 mb-4">
                      <div className="text-sm">
                        {withinDeliveryRange ? (
                          <div className="flex items-center space-x-2 text-green-700">
                            <Truck className="h-4 w-4" />
                            <span className="font-medium">Delivery & Pickup Available</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-orange-700">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">Pickup Only (Beyond delivery range)</span>
                          </div>
                        )}
                        <div className="text-xs text-secondary-600 mt-1">
                          {seller.deliveryTime}
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <h4 className="font-medium text-secondary-900 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {seller.specialties.map(specialty => (
                          <span key={specialty} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="lg:w-80 flex-shrink-0">
                    <div className="bg-white border border-secondary-200 rounded-xl p-6">
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-secondary-900 mb-2">
                          ₹{seller.price}
                        </div>
                        {seller.price !== plant.price && (
                          <div className="text-sm text-secondary-500">
                            {seller.price > plant.price ? '+' : ''}₹{seller.price - plant.price} vs avg
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {withinDeliveryRange ? (
                          <div className="grid grid-cols-1 gap-3">
                            <button
                              onClick={() => onDelivery(seller)}
                              disabled={seller.stock === 0}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                              <Truck className="h-5 w-5" />
                              <span>Order for Delivery</span>
                            </button>
                            
                            <button
                              onClick={() => onReserve(seller)}
                              disabled={seller.stock === 0}
                              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                              <Calendar className="h-5 w-5" />
                              <span>Reserve for Pickup</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onReserve(seller)}
                            disabled={seller.stock === 0}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <Calendar className="h-5 w-5" />
                            <span>Reserve for Pickup</span>
                          </button>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => window.open(`tel:${seller.phone}`, '_self')}
                            className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Phone className="h-4 w-4" />
                            <span>Call</span>
                          </button>
                          
                          <button className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2">
                            <Navigation className="h-4 w-4" />
                            <span>Directions</span>
                          </button>
                        </div>

                        <button className="w-full px-4 py-2 border border-secondary-300 text-secondary-700 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center space-x-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>Message Seller</span>
                        </button>
                      </div>

                      {/* Stock Warning */}
                      {seller.stock < 5 && seller.stock > 0 && (
                        <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-warning-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Only {seller.stock} left in stock!</span>
                          </div>
                        </div>
                      )}

                      {seller.stock === 0 && (
                        <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-error-800">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Out of stock</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Plant Info */}
      <div className="mt-12 bg-primary-50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-primary-900 mb-4">Why Choose Local?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-primary-800 mb-2">Same-Day Delivery</h4>
            <p className="text-primary-700 text-sm">Get your plants within hours, not days</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-primary-800 mb-2">Quality Assured</h4>
            <p className="text-primary-700 text-sm">Locally verified sellers and healthy plants</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-primary-800 mb-2">Support Local</h4>
            <p className="text-primary-700 text-sm">Help your community's plant businesses thrive</p>
          </div>
        </div>
      </div>
    </div>
  );
};