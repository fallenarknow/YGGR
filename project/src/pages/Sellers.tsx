import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Shield, Calendar, Users, ArrowRight, Filter, Navigation, Phone, Globe, ChevronDown, Leaf, ShoppingBag, X, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { mockSellers, mockPlants } from '../data/mockData';
import { GlobalLocationSelector } from '../components/GlobalLocationSelector';
import { LocationData, calculateDistance } from '../lib/geolocation';
import { Seller, Plant } from '../types';

export const Sellers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(true);
  const [maxDistance, setMaxDistance] = useState(50);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [sellerPlants, setSellerPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const sellerTypes = ['all', 'nursery', 'grower', 'individual'];

  // Generate mock coordinates for sellers based on user location
  const getSellersWithDistance = () => {
    if (!userLocation) return [];
    
    return mockSellers.map(seller => {
      // Generate a random offset between -0.5 and 0.5 degrees
      // This will create points roughly within 50km of the user
      const latOffset = (Math.random() - 0.5) * 0.9;
      const lngOffset = (Math.random() - 0.5) * 0.9;
      
      const latitude = userLocation.latitude + latOffset;
      const longitude = userLocation.longitude + lngOffset;
      
      // Calculate distance from user
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude
      );
      
      return {
        ...seller,
        distance,
        latitude,
        longitude
      };
    });
  };

  // Filter sellers based on location and other criteria
  const filteredSellers = userLocation 
    ? getSellersWithDistance()
        .filter(seller => {
          // Filter by search query
          const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              seller.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              seller.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
          
          // Filter by seller type
          const matchesType = selectedType === 'all' || seller.type === selectedType;
          
          // Filter by distance
          const matchesDistance = seller.distance <= maxDistance;
          
          return matchesSearch && matchesType && matchesDistance;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case 'distance':
              return a.distance - b.distance;
            case 'rating':
              return b.rating - a.rating;
            case 'reviews':
              return b.reviewCount - a.reviewCount;
            case 'name':
              return a.name.localeCompare(b.name);
            case 'newest':
              return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
            default:
              return 0;
          }
        })
    : [];

  const getSellerTypeIcon = (type: string) => {
    switch (type) {
      case 'nursery':
        return '🏪';
      case 'grower':
        return '🌱';
      case 'individual':
        return '👤';
      default:
        return '🌿';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const handleLocationSelect = (location: LocationData) => {
    setUserLocation(location);
    setShowLocationSelector(false);
  };

  const handleChangeLocation = () => {
    setShowLocationSelector(true);
    setSelectedSeller(null);
  };

  const handleViewSellerProfile = (seller: Seller) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, you would fetch this data from your API
      // For now, we'll filter the mock plants data
      const plants = mockPlants.filter(plant => plant.sellerId === seller.id);
      setSellerPlants(plants);
      setSelectedSeller(seller);
    } catch (err) {
      setError('Failed to load seller profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSellers = () => {
    setSelectedSeller(null);
    setSellerPlants([]);
  };

  // Render seller profile view
  if (selectedSeller) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={handleBackToSellers}
            className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowRight className="h-5 w-5 rotate-180" />
            <span>Back to Sellers</span>
          </button>

          {/* Seller Profile Header */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-600 relative">
              {selectedSeller.verified && (
                <div className="absolute top-4 right-4 bg-white text-primary-600 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Verified Seller</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-6">
                <div className="w-32 h-32 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
                  <img
                    src={selectedSeller.avatar}
                    alt={selectedSeller.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 md:pb-4">
                  <h1 className="text-3xl font-bold text-secondary-900">{selectedSeller.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-secondary-500" />
                      <span className="text-secondary-600">{selectedSeller.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{selectedSeller.rating}</span>
                      <span className="text-secondary-500">({selectedSeller.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-secondary-500" />
                      <span className="text-secondary-600">Joined {formatDate(selectedSeller.joinedDate)}</span>
                    </div>
                    {userLocation && (selectedSeller as any).distance && (
                      <div className="flex items-center space-x-1">
                        <Navigation className="h-4 w-4 text-secondary-500" />
                        <span className="text-secondary-600">{formatDistance((selectedSeller as any).distance)} away</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seller Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-2">About</h2>
                <p className="text-secondary-700">{selectedSeller.description}</p>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-3">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedSeller.specialties.map(specialty => (
                    <span key={specialty} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-secondary-50 p-4 rounded-xl">
                  <h3 className="font-medium text-secondary-900 mb-2 flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-primary-600" />
                    <span>Contact</span>
                  </h3>
                  <button className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                    Call Seller
                  </button>
                </div>
                <div className="bg-secondary-50 p-4 rounded-xl">
                  <h3 className="font-medium text-secondary-900 mb-2 flex items-center space-x-2">
                    <Navigation className="h-5 w-5 text-primary-600" />
                    <span>Directions</span>
                  </h3>
                  <button className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Customer Reviews</h2>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="font-bold text-lg">{selectedSeller.rating}</span>
                <span className="text-secondary-500">({selectedSeller.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Review Distribution */}
            <div className="mb-6">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  // Mock percentage based on the seller's overall rating
                  const percentage = rating === 5 ? 70 :
                                     rating === 4 ? 20 :
                                     rating === 3 ? 7 :
                                     rating === 2 ? 2 : 1;
                  return (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm w-8">{rating} ★</span>
                      <div className="flex-1 bg-secondary-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-secondary-600 w-8">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sample Reviews */}
            <div className="space-y-6">
              {/* Generate some mock reviews based on the seller's review count */}
              {[...Array(3)].map((_, index) => {
                const reviewerNames = ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Kim', 'Priya Patel'];
                const reviewTexts = [
                  'Great experience! The plants arrived in perfect condition and exactly as described.',
                  'Excellent seller with high-quality plants. Will definitely buy from them again.',
                  'Very knowledgeable and helpful. They gave me great advice on caring for my new plants.',
                  'Fast delivery and the plants were packaged with care. Highly recommend!',
                  'The plants I received were healthy and beautiful. This seller really knows their stuff!'
                ];
                const randomName = reviewerNames[Math.floor(Math.random() * reviewerNames.length)];
                const randomText = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];
                const randomDate = new Date();
                randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
                
                return (
                  <div key={index} className="border-b border-secondary-200 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-secondary-900">{randomName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < 5 ? 'text-yellow-500 fill-current' : 'text-secondary-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-secondary-500">{randomDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-secondary-700 mb-3">{randomText}</p>
                    <button className="text-sm text-secondary-500 hover:text-secondary-700">
                      Helpful (12)
                    </button>
                  </div>
                );
              })}
            </div>

            {/* View More Button */}
            <div className="mt-6 text-center">
              <button className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:border-primary-500 hover:text-primary-600 transition-colors">
                View All Reviews
              </button>
            </div>
          </div>

          {/* Plants Inventory Section */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">Available Plants</h2>
              <div className="text-secondary-600">
                {sellerPlants.length} plants in stock
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">{error}</p>
              </div>
            ) : sellerPlants.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No Plants Available</h3>
                <p className="text-secondary-600 mb-6">
                  This seller doesn't have any plants listed at the moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellerPlants.map(plant => (
                  <div key={plant.id} className="bg-white border border-secondary-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-secondary-100 overflow-hidden">
                      <img
                        src={plant.images[0]}
                        alt={plant.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-secondary-900 hover:text-primary-600 transition-colors">
                        {plant.name}
                      </h3>
                      <p className="text-sm text-secondary-500 mb-2">{plant.botanicalName}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-secondary-900">₹{plant.price}</span>
                        <Link
                          to={`/plant/${plant.id}`}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sellerPlants.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  to={`/marketplace?seller=${selectedSeller.id}`}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Shop All Plants</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {showLocationSelector ? (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-4">
              Find Plant Sellers Near You
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Discover trusted plant nurseries, growers, and enthusiasts in your area
            </p>
          </div>
          
          <GlobalLocationSelector
            onLocationSelect={handleLocationSelect}
            currentLocation={userLocation}
            showSavedLocations={true}
            allowManualEntry={true}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-primary-500 p-3 rounded-full">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-secondary-900">Verified Sellers</h1>
            </div>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Showing plant sellers within {maxDistance}km of your location
            </p>
            
            {userLocation && (
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mt-4">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">
                  {userLocation.city}, {userLocation.country}
                </span>
                <button 
                  onClick={handleChangeLocation}
                  className="ml-2 text-primary-600 hover:text-primary-800 font-medium"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sellers by name, location, or specialty..."
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Sellers</option>
                <option value="nursery">Nurseries</option>
                <option value="grower">Growers</option>
                <option value="individual">Individual Sellers</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="distance">Nearest First</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="name">Name (A-Z)</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
            
            {/* Distance Filter */}
            <div className="mt-6 pt-4 border-t border-secondary-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-secondary-700">
                  Maximum Distance: {maxDistance}km
                </label>
                <button 
                  onClick={() => setMaxDistance(50)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Reset
                </button>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-secondary-500 mt-1">
                <span>5km</span>
                <span>25km</span>
                <span>50km</span>
                <span>75km</span>
                <span>100km</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">{filteredSellers.length}</div>
              <div className="text-sm text-secondary-600">Sellers Near You</div>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">4.8</div>
              <div className="text-sm text-secondary-600">Average Rating</div>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">98%</div>
              <div className="text-sm text-secondary-600">Plant Survival Rate</div>
            </div>
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">24h</div>
              <div className="text-sm text-secondary-600">Avg Response Time</div>
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">
              {filteredSellers.length} sellers found
            </h2>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Sellers Found</h3>
              <p className="text-secondary-600 mb-6 max-w-md mx-auto">
                We couldn't find any sellers matching your criteria within {maxDistance}km of your location.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => setMaxDistance(Math.min(maxDistance + 25, 100))}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Increase Search Radius
                </button>
                <button
                  onClick={handleChangeLocation}
                  className="px-6 py-3 border border-secondary-300 text-secondary-700 rounded-lg hover:border-primary-500 transition-colors"
                >
                  Change Location
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSellers.map(seller => (
                <div key={seller.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  {/* Header */}
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-br from-primary-500 to-primary-600"></div>
                    <div className="absolute -bottom-6 left-6">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-2xl">{getSellerTypeIcon(seller.type)}</span>
                      </div>
                    </div>
                    {seller.verified && (
                      <div className="absolute top-4 right-4 bg-success-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <Shield className="h-3 w-3" />
                        <span>Verified</span>
                      </div>
                    )}
                    {seller.distance && (
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-primary-700 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <Navigation className="h-3 w-3" />
                        <span>{formatDistance(seller.distance)}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-8">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {seller.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-secondary-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{seller.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{seller.rating}</span>
                          <span className="text-sm text-secondary-500">({seller.reviewCount} reviews)</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-secondary-500">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {formatDate(seller.joinedDate)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-secondary-700 mb-4 line-clamp-3">
                      {seller.description}
                    </p>

                    {/* Specialties */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-secondary-900 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-1">
                        {seller.specialties.map(specialty => (
                          <span key={specialty} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewSellerProfile(seller)}
                        className="flex-1 text-center px-4 py-2 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleViewSellerProfile(seller)}
                        className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        Shop Plants
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Become a Seller CTA */}
          <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Become a Seller</h2>
            <p className="text-xl mb-6 opacity-90">
              Join our marketplace and start selling your plants to thousands of plant enthusiasts
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-2">🌱</div>
                <h3 className="font-semibold mb-2">Free to Join</h3>
                <p className="text-sm opacity-80">No upfront costs or monthly fees</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="font-semibold mb-2">Low Commission</h3>
                <p className="text-sm opacity-80">Only 5-8% per successful sale</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <h3 className="font-semibold mb-2">Grow Your Business</h3>
                <p className="text-sm opacity-80">Reach customers nationwide</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/seller/signup"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Start Selling Today
              </Link>
              <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};