import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Navigation, Clock, Star, Truck, Package, AlertCircle } from 'lucide-react';
import { LocationData, calculateDistance } from '../lib/geolocation';
import { locationDB, NearbySellerResult } from '../lib/locationDatabase';
import { Plant } from '../types';
import { PlantCard } from './PlantCard';

interface ProximityBasedPlantSearchProps {
  userLocation: LocationData;
  onPlantSelect: (plant: Plant) => void;
  onAddToCart: (plant: Plant) => void;
  searchQuery?: string;
  maxDistance?: number;
}

interface PlantWithDistance extends Plant {
  distance: number;
  sellerLocation: any;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  estimatedDeliveryTime?: string;
}

export const ProximityBasedPlantSearch: React.FC<ProximityBasedPlantSearchProps> = ({
  userLocation,
  onPlantSelect,
  onAddToCart,
  searchQuery = '',
  maxDistance = 50
}) => {
  const [plants, setPlantsWithDistance] = useState<PlantWithDistance[]>([]);
  const [nearbySellers, setNearbySellers] = useState<NearbySellerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating' | 'delivery_time'>('distance');
  const [filterDeliveryOnly, setFilterDeliveryOnly] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState(maxDistance);

  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      loadNearbyPlantsAndSellers();
    }
  }, [userLocation, selectedDistance]);

  const loadNearbyPlantsAndSellers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Find nearby sellers
      const sellers = await locationDB.findNearbySellers(
        userLocation.latitude,
        userLocation.longitude,
        selectedDistance
      );
      
      setNearbySellers(sellers);

      // Mock plant data with seller information
      // In a real app, this would query plants from nearby sellers
      const mockPlantsWithSellers = await generateMockPlantsWithSellers(sellers);
      setPlantsWithDistance(mockPlantsWithSellers);

    } catch (err: any) {
      setError(err.message || 'Failed to load nearby plants');
      console.error('Error loading nearby plants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock function to generate plants with seller data
  const generateMockPlantsWithSellers = async (sellers: NearbySellerResult[]): Promise<PlantWithDistance[]> => {
    const mockPlants: Plant[] = [
      {
        id: '1',
        seller_id: sellers[0]?.sellerId || 'seller1',
        name: 'Monstera Deliciosa',
        botanical_name: 'Monstera deliciosa',
        price: 45.99,
        original_price: 59.99,
        description: 'Beautiful Swiss Cheese Plant with split leaves',
        category: 'Indoor Plants',
        size: 'medium',
        care_level: 2,
        light_requirement: 'bright',
        watering_frequency: 'medium',
        pet_safe: false,
        indoor_outdoor: 'indoor',
        stock: 15,
        images: ['https://images.pexels.com/photos/6912796/pexels-photo-6912796.jpeg?auto=compress&cs=tinysrgb&w=800'],
        status: 'active',
        views: 120,
        inquiries: 15,
        sold_count: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        seller_id: sellers[1]?.sellerId || 'seller2',
        name: 'Snake Plant',
        botanical_name: 'Sansevieria trifasciata',
        price: 28.99,
        description: 'Low maintenance air purifying plant',
        category: 'Indoor Plants',
        size: 'medium',
        care_level: 1,
        light_requirement: 'low',
        watering_frequency: 'low',
        pet_safe: false,
        indoor_outdoor: 'indoor',
        stock: 23,
        images: ['https://images.pexels.com/photos/7689734/pexels-photo-7689734.jpeg?auto=compress&cs=tinysrgb&w=800'],
        status: 'active',
        views: 89,
        inquiries: 12,
        sold_count: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return mockPlants.map((plant, index) => {
      const seller = sellers[index % sellers.length];
      const distance = seller ? seller.distanceKm : Math.random() * selectedDistance;
      
      return {
        ...plant,
        distance,
        sellerLocation: seller?.sellerLocation,
        deliveryAvailable: seller?.deliveryAvailable || false,
        pickupAvailable: seller?.pickupAvailable || true,
        estimatedDeliveryTime: distance < 10 ? '2-4 hours' : distance < 25 ? '4-8 hours' : '1-2 days'
      };
    });
  };

  const filteredAndSortedPlants = useMemo(() => {
    let filtered = plants.filter(plant => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!plant.name.toLowerCase().includes(query) &&
            !plant.botanical_name.toLowerCase().includes(query) &&
            !plant.category.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Delivery filter
      if (filterDeliveryOnly && !plant.deliveryAvailable) {
        return false;
      }

      return true;
    });

    // Sort plants
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'price':
          return a.price - b.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'delivery_time':
          return a.distance - b.distance; // Closer = faster delivery
        default:
          return a.distance - b.distance;
      }
    });

    return filtered;
  }, [plants, searchQuery, filterDeliveryOnly, sortBy]);

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getDeliveryIcon = (plant: PlantWithDistance) => {
    if (plant.deliveryAvailable && plant.pickupAvailable) {
      return <Truck className="h-4 w-4 text-green-600" />;
    } else if (plant.pickupAvailable) {
      return <Package className="h-4 w-4 text-blue-600" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Finding plants near you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Unable to load plants</h3>
        <p className="text-secondary-600 mb-4">{error}</p>
        <button
          onClick={loadNearbyPlantsAndSellers}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Info */}
      <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
        <div className="flex items-center space-x-3">
          <MapPin className="h-5 w-5 text-primary-600" />
          <div>
            <div className="font-medium text-primary-800">
              Searching near {userLocation.city}, {userLocation.country}
            </div>
            <div className="text-sm text-primary-600">
              Found {nearbySellers.length} sellers within {selectedDistance}km
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Distance Slider */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Search Radius: {selectedDistance}km
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={selectedDistance}
              onChange={(e) => setSelectedDistance(parseInt(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-secondary-500 mt-1">
              <span>5km</span>
              <span>100km</span>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="distance">Distance</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="delivery_time">Delivery Time</option>
            </select>
          </div>

          {/* Delivery Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="delivery-only"
              checked={filterDeliveryOnly}
              onChange={(e) => setFilterDeliveryOnly(e.target.checked)}
              className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="delivery-only" className="text-sm font-medium text-secondary-700">
              Delivery available only
            </label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          {filteredAndSortedPlants.length} plants found near you
        </h3>

        {filteredAndSortedPlants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              No plants found
            </h3>
            <p className="text-secondary-600 mb-6">
              Try expanding your search radius or adjusting your filters
            </p>
            <button
              onClick={() => {
                setSelectedDistance(Math.min(selectedDistance + 25, 100));
                setFilterDeliveryOnly(false);
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Expand Search Area
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedPlants.map((plant) => (
              <div key={plant.id} className="relative">
                <PlantCard
                  plant={plant}
                  onAddToCart={onAddToCart}
                  onViewDetails={() => onPlantSelect(plant)}
                  showSellerInfo={false}
                />
                
                {/* Distance and Delivery Info Overlay */}
                <div className="absolute top-3 left-3 space-y-1">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-secondary-700 flex items-center space-x-1">
                    <Navigation className="h-3 w-3" />
                    <span>{formatDistance(plant.distance)}</span>
                  </div>
                  
                  {plant.deliveryAvailable && (
                    <div className="bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1">
                      <Truck className="h-3 w-3" />
                      <span>{plant.estimatedDeliveryTime}</span>
                    </div>
                  )}
                  
                  {!plant.deliveryAvailable && plant.pickupAvailable && (
                    <div className="bg-blue-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1">
                      <Package className="h-3 w-3" />
                      <span>Pickup only</span>
                    </div>
                  )}
                </div>

                {/* Seller Info */}
                {plant.sellerLocation && (
                  <div className="mt-3 p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-secondary-900 text-sm">
                          {plant.sellerLocation.businessName}
                        </div>
                        <div className="text-xs text-secondary-600">
                          {plant.sellerLocation.city}, {plant.sellerLocation.state}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-secondary-500">
                          {formatDistance(plant.distance)} away
                        </div>
                        {plant.sellerLocation.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">{plant.sellerLocation.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};