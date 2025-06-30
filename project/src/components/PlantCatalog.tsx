import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Heart, Eye, ArrowLeft, MapPin, Star, Phone, Navigation, Clock, ShoppingCart, Calendar, MessageCircle, Truck, Package } from 'lucide-react';
import { Plant } from '../types';

interface PlantCatalogProps {
  plants: Plant[];
  onPlantSelect: (plant: Plant) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userLocation?: any;
}

export const PlantCatalog: React.FC<PlantCatalogProps> = ({
  plants,
  onPlantSelect,
  searchQuery,
  onSearchChange,
  userLocation
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 2000],
    careLevel: '',
    lightRequirement: '',
    petSafe: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [likedPlants, setLikedPlants] = useState<Set<string>>(new Set());

  const categories = ['All', 'Indoor Plants', 'Outdoor Plants', 'Succulents', 'Flowering Plants', 'Herbs'];
  const careLevels = ['All', 'Beginner (1-2)', 'Intermediate (3)', 'Advanced (4-5)'];
  const lightRequirements = ['All', 'Low Light', 'Medium Light', 'Bright Light', 'Direct Sun'];

  // Filter and sort plants
  const filteredPlants = plants.filter(plant => {
    const matchesSearch = !searchQuery || 
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.botanical_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !filters.category || filters.category === 'All' || plant.category === filters.category;
    const matchesPrice = plant.price >= filters.priceRange[0] && plant.price <= filters.priceRange[1];
    const matchesCareLevel = !filters.careLevel || filters.careLevel === 'All' || 
      (filters.careLevel === 'Beginner (1-2)' && plant.care_level <= 2) ||
      (filters.careLevel === 'Intermediate (3)' && plant.care_level === 3) ||
      (filters.careLevel === 'Advanced (4-5)' && plant.care_level >= 4);
    const matchesLight = !filters.lightRequirement || filters.lightRequirement === 'All' || 
      plant.light_requirement.toLowerCase().includes(filters.lightRequirement.toLowerCase().replace(' light', '').replace(' sun', ''));
    const matchesPetSafe = !filters.petSafe || plant.pet_safe;

    return matchesSearch && matchesCategory && matchesPrice && matchesCareLevel && matchesLight && matchesPetSafe;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.rating || 0) - (a.rating || 0);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const toggleLike = (plantId: string) => {
    setLikedPlants(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(plantId)) {
        newLiked.delete(plantId);
      } else {
        newLiked.add(plantId);
      }
      return newLiked;
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 2000],
      careLevel: '',
      lightRequirement: '',
      petSafe: false
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Plant Catalog
        </h1>
        <p className="text-secondary-600 max-w-2xl mx-auto">
          Browse our beautiful collection of plants. Click on any plant to see local sellers and pricing.
        </p>
        {userLocation && (
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mt-4">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{userLocation.name}, {userLocation.state}</span>
          </div>
        )}
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search plants by name or type..."
              className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-3 border rounded-xl transition-colors ${
                showFilters ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-300 text-secondary-700 hover:border-primary-300'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-secondary-200 pt-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'All' ? '' : category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Care Level</label>
                <select
                  value={filters.careLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, careLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {careLevels.map(level => (
                    <option key={level} value={level === 'All' ? '' : level}>{level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Light Requirement</label>
                <select
                  value={filters.lightRequirement}
                  onChange={(e) => setFilters(prev => ({ ...prev, lightRequirement: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {lightRequirements.map(light => (
                    <option key={light} value={light === 'All' ? '' : light}>{light}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Price Range</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [0, parseInt(e.target.value)] }))}
                    className="w-full accent-primary-600"
                  />
                  <div className="flex justify-between text-sm text-secondary-600">
                    <span>₹0</span>
                    <span>₹{filters.priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.petSafe}
                  onChange={(e) => setFilters(prev => ({ ...prev, petSafe: e.target.checked }))}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-700">Pet Safe Only</span>
              </label>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">
          {filteredPlants.length} plants found
        </h3>
      </div>

      {/* Plant Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => onPlantSelect(plant)}
            >
              {/* Image */}
              <div className="relative aspect-square bg-secondary-100 overflow-hidden">
                <img
                  src={plant.images[0]}
                  alt={plant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(plant.id);
                    }}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      likedPlants.has(plant.id) ? 'bg-error-500 text-white' : 'bg-white/80 text-secondary-600 hover:text-error-500'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${likedPlants.has(plant.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 space-y-1">
                  {plant.pet_safe && (
                    <span className="inline-block bg-success-500 text-white text-xs px-2 py-1 rounded-full">
                      🐾
                    </span>
                  )}
                  {plant.original_price && (
                    <span className="inline-block bg-error-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Sale
                    </span>
                  )}
                </div>

                {/* View Details Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">View Sellers</p>
                  </div>
                </div>
              </div>

              {/* Plant Info - Minimal */}
              <div className="p-4">
                <h3 className="font-bold text-secondary-900 text-sm sm:text-base line-clamp-1 group-hover:text-primary-600 transition-colors">
                  {plant.name}
                </h3>
                <p className="text-xs sm:text-sm text-secondary-500 italic line-clamp-1 mb-2">
                  {plant.botanical_name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-secondary-900">₹{plant.price}</span>
                  {plant.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-warning-500 fill-current" />
                      <span className="text-xs font-medium">{plant.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => onPlantSelect(plant)}
            >
              <div className="flex">
                {/* Image */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-secondary-100 overflow-hidden flex-shrink-0">
                  <img
                    src={plant.images[0]}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 space-y-1">
                    {plant.pet_safe && (
                      <span className="inline-block bg-success-500 text-white text-xs px-2 py-1 rounded-full">
                        🐾
                      </span>
                    )}
                    {plant.original_price && (
                      <span className="inline-block bg-error-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Sale
                      </span>
                    )}
                  </div>
                </div>

                {/* Plant Info */}
                <div className="flex-1 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-secondary-900 group-hover:text-primary-600 transition-colors mb-1">
                        {plant.name}
                      </h3>
                      <p className="text-sm text-secondary-500 italic mb-3">{plant.botanical_name}</p>
                      
                      <p className="text-sm text-secondary-600 mb-4 line-clamp-2">{plant.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-secondary-600">
                        <span>Care: {plant.care_level}/5</span>
                        <span className="capitalize">{plant.light_requirement} light</span>
                        <span className="capitalize">{plant.watering_frequency} water</span>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-secondary-900 mb-2">₹{plant.price}</div>
                      {plant.original_price && (
                        <div className="text-sm text-secondary-500 line-through mb-2">₹{plant.original_price}</div>
                      )}
                      {plant.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-warning-500 fill-current" />
                          <span className="text-sm font-medium">{plant.rating}</span>
                          <span className="text-sm text-secondary-500">({plant.reviewCount || 0})</span>
                        </div>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(plant.id);
                        }}
                        className={`mt-3 p-2 rounded-full transition-colors ${
                          likedPlants.has(plant.id) ? 'bg-error-500 text-white' : 'bg-secondary-100 text-secondary-600 hover:text-error-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedPlants.has(plant.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {filteredPlants.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            No plants found
          </h3>
          <p className="text-secondary-600 mb-6">
            Try adjusting your search or filters to discover more plants
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};