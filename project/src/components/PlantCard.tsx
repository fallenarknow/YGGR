import React from 'react';
import { Heart, Star, ShoppingCart, Droplets, Sun, Shield, Eye, MapPin, Clock, Calendar } from 'lucide-react';
import { Plant } from '../types';

interface PlantCardProps {
  plant: Plant;
  onAddToCart: (plant: Plant) => void;
  onViewDetails: (plantId: string) => void;
  showSellerInfo?: boolean;
}

export const PlantCard: React.FC<PlantCardProps> = ({ 
  plant, 
  onAddToCart, 
  onViewDetails, 
  showSellerInfo = true 
}) => {
  const [isLiked, setIsLiked] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const getCareIcon = (level: number) => {
    const icons = ['🌱', '🌿', '🍃', '🌳', '🌲'];
    return icons[level - 1] || '🌱';
  };

  const getLightIcon = (light: string) => {
    switch (light) {
      case 'low': return '🌙';
      case 'medium': return '⛅';
      case 'bright': return '☀️';
      case 'direct': return '🔥';
      default: return '☀️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'draft':
        return 'bg-warning-100 text-warning-800';
      case 'inactive':
        return 'bg-secondary-100 text-secondary-800';
      case 'out_of_stock':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden transform hover:scale-105">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <div className="aspect-square bg-secondary-100">
          <img
            src={plant.images[0]}
            alt={plant.alt_texts?.[0] || plant.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-secondary-200 animate-pulse" />
          )}
        </div>
        
        {/* Overlay Actions */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-colors ${
              isLiked ? 'bg-error-500 text-white' : 'bg-white/80 text-secondary-600 hover:text-error-500'
            }`}
          >
            <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => onViewDetails(plant.id)}
            className="p-1.5 sm:p-2 bg-white/80 text-secondary-600 rounded-full backdrop-blur-sm hover:text-primary-600 transition-colors"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Status & Tags */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 space-y-1">
          {plant.original_price && (
            <span className="inline-block bg-error-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
              Sale
            </span>
          )}
          {plant.pet_safe && (
            <span className="inline-block bg-success-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center space-x-1">
              <Shield className="h-2 w-2 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">Pet Safe</span>
              <span className="sm:hidden">🐾</span>
            </span>
          )}
          {plant.special_features && plant.special_features.length > 0 && (
            <span className="inline-block bg-primary-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
              {plant.special_features[0]}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {plant.stock < 5 && plant.stock > 0 && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
            <span className="inline-block bg-warning-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
              Only {plant.stock} left!
            </span>
          </div>
        )}

        {plant.stock === 0 && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
            <span className="inline-block bg-error-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Plant Name & Botanical Name */}
        <div className="mb-2 sm:mb-3">
          <h3 className="font-bold text-base sm:text-lg text-secondary-900 group-hover:text-primary-600 transition-colors cursor-pointer line-clamp-1">
            {plant.name}
          </h3>
          <p className="text-xs sm:text-sm text-secondary-500 italic line-clamp-1">{plant.botanical_name}</p>
        </div>

        {/* Description */}
        {plant.description && (
          <p className="text-xs sm:text-sm text-secondary-600 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
            {plant.description}
          </p>
        )}

        {/* Care Requirements */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1" title={`Care Level: ${plant.care_level}/5`}>
              <span className="text-sm sm:text-lg">{getCareIcon(plant.care_level)}</span>
              <span className="text-xs font-medium">{plant.care_level}/5</span>
            </div>
            <div className="flex items-center space-x-1" title={`Light: ${plant.light_requirement}`}>
              <span className="text-sm sm:text-lg">{getLightIcon(plant.light_requirement)}</span>
            </div>
            <div className="flex items-center space-x-1" title={`Watering: ${plant.watering_frequency}`}>
              <Droplets className={`h-3 w-3 sm:h-4 sm:w-4 ${
                plant.watering_frequency === 'high' ? 'text-blue-500' :
                plant.watering_frequency === 'medium' ? 'text-blue-400' : 'text-blue-300'
              }`} />
            </div>
          </div>
          <span className="text-xs text-secondary-500 capitalize bg-secondary-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
            {plant.size}
          </span>
        </div>

        {/* Plant Stats - Hidden on mobile to save space */}
        <div className="hidden sm:grid grid-cols-3 gap-2 text-xs text-secondary-600 mb-4">
          <div className="text-center bg-secondary-50 rounded-lg py-2">
            <div className="font-bold text-secondary-900">{plant.views || 0}</div>
            <div>Views</div>
          </div>
          <div className="text-center bg-secondary-50 rounded-lg py-2">
            <div className="font-bold text-secondary-900">{plant.inquiries || 0}</div>
            <div>Inquiries</div>
          </div>
          <div className="text-center bg-secondary-50 rounded-lg py-2">
            <div className="font-bold text-secondary-900">{plant.sold_count || 0}</div>
            <div>Sold</div>
          </div>
        </div>

        {/* Rating */}
        {plant.rating && (
          <div className="flex items-center space-x-1 mb-2 sm:mb-3">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-warning-500 fill-current" />
            <span className="text-xs sm:text-sm font-medium">{plant.rating}</span>
            <span className="text-xs sm:text-sm text-secondary-500">({plant.reviewCount || 0})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-lg sm:text-xl font-bold text-secondary-900">₹{plant.price}</span>
            {plant.original_price && (
              <span className="text-xs sm:text-sm text-secondary-500 line-through">₹{plant.original_price}</span>
            )}
          </div>
          {plant.original_price && (
            <span className="text-xs bg-error-100 text-error-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium">
              Save ₹{plant.original_price - plant.price}
            </span>
          )}
        </div>

        {/* Additional Info - Simplified for mobile */}
        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          {plant.origin_info && (
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-secondary-600">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
              <span className="line-clamp-1">{plant.origin_info}</span>
            </div>
          )}
          
          {plant.growth_rate && (
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-secondary-600">
              <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
              <span>Growth: {plant.growth_rate}</span>
            </div>
          )}

          {plant.created_at && (
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-secondary-500">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
              <span>Listed {formatDate(plant.created_at)}</span>
            </div>
          )}
        </div>

        {/* Seller Info */}
        {showSellerInfo && plant.sellerName && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-xs sm:text-sm text-primary-700">
              by <span className="font-medium text-primary-800">{plant.sellerName}</span>
            </p>
          </div>
        )}

        {/* Mature Size & Pot Details - Hidden on mobile */}
        {(plant.mature_size_expectations || plant.pot_details) && (
          <div className="hidden sm:block mb-4 text-xs text-secondary-600 space-y-1">
            {plant.mature_size_expectations && (
              <div>
                <span className="font-medium">Mature size:</span> {plant.mature_size_expectations}
              </div>
            )}
            {plant.pot_details && (
              <div>
                <span className="font-medium">Pot:</span> {plant.pot_details}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => onViewDetails(plant.id)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-primary-500 text-primary-600 rounded-lg sm:rounded-xl hover:bg-primary-50 transition-colors text-xs sm:text-sm font-medium"
          >
            View Details
          </button>
          <button
            onClick={() => onAddToCart(plant)}
            disabled={plant.stock === 0}
            className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1 sm:space-x-2 ${
              plant.stock === 0
                ? 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{plant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};