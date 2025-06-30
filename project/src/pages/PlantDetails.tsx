import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Shield, Truck, ArrowRight, Sun, Droplets, Thermometer, Flower, AlertTriangle } from 'lucide-react';
import { mockPlants, mockCareGuides } from '../data/mockData';
import { Plant } from '../types';

interface PlantDetailsProps {
  onAddToCart: (plant: Plant) => void;
}

export const PlantDetails: React.FC<PlantDetailsProps> = ({ onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'reviews'>('overview');
  const [isLiked, setIsLiked] = useState(false);

  const plant = mockPlants.find(p => p.id === id);
  const careGuide = mockCareGuides.find(c => c.plantId === id);

  if (!plant) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Plant not found</h2>
          <Link to="/marketplace" className="text-primary-600 hover:text-primary-700">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const getCareIcon = (level: number) => {
    const icons = ['🌱', '🌿', '🍃', '🌳', '🌲'];
    return icons[level - 1] || '🌱';
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-secondary-600 mb-8">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-primary-600">Marketplace</Link>
          <span>/</span>
          <span className="text-secondary-900">{plant.name}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-secondary-100 rounded-lg overflow-hidden">
                <img
                  src={plant.images[selectedImage]}
                  alt={plant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {plant.images.length > 1 && (
                <div className="flex space-x-2">
                  {plant.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-primary-500' : 'border-secondary-200'
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
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-secondary-900">{plant.name}</h1>
                    <p className="text-lg text-secondary-600 italic">{plant.botanicalName}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`p-2 rounded-lg transition-colors ${
                        isLiked ? 'bg-error-500 text-white' : 'bg-secondary-100 text-secondary-600 hover:text-error-500'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 bg-secondary-100 text-secondary-600 rounded-lg hover:text-primary-600 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(plant.rating) ? 'text-warning-500 fill-current' : 'text-secondary-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{plant.rating}</span>
                  <span className="text-sm text-secondary-500">({plant.reviewCount} reviews)</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {plant.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                  {plant.petSafe && (
                    <span className="px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Pet Safe</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-b border-secondary-200 py-4">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl font-bold text-secondary-900">${plant.price}</span>
                  {plant.originalPrice && (
                    <span className="text-xl text-secondary-500 line-through">${plant.originalPrice}</span>
                  )}
                  {plant.originalPrice && (
                    <span className="px-2 py-1 bg-error-500 text-white text-sm rounded-full">
                      Save ${(plant.originalPrice - plant.price).toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-secondary-600">
                  Free shipping on orders over $50 • In stock ({plant.stock} available)
                </p>
              </div>

              {/* Quick Care Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getCareIcon(plant.careLevel)}</span>
                    <span className="font-medium">Care Level</span>
                  </div>
                  <p className="text-sm text-secondary-600">{plant.careLevel}/5 difficulty</p>
                </div>
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sun className="h-5 w-5 text-warning-500" />
                    <span className="font-medium">Light</span>
                  </div>
                  <p className="text-sm text-secondary-600 capitalize">{plant.lightRequirement}</p>
                </div>
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Watering</span>
                  </div>
                  <p className="text-sm text-secondary-600 capitalize">{plant.wateringFrequency}</p>
                </div>
                <div className="bg-secondary-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">📏</span>
                    <span className="font-medium">Size</span>
                  </div>
                  <p className="text-sm text-secondary-600 capitalize">{plant.size}</p>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="font-medium">Quantity:</label>
                  <div className="flex items-center border border-secondary-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-secondary-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-secondary-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(plant.stock, quantity + 1))}
                      className="px-3 py-2 hover:bg-secondary-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(plant)}
                  disabled={plant.stock === 0}
                  className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    plant.stock === 0
                      ? 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{plant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
              </div>

              {/* Seller Info */}
              <div className="bg-secondary-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Sold by</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{plant.sellerName[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-primary-600">{plant.sellerName}</p>
                    <div className="flex items-center space-x-1 text-sm text-secondary-600">
                      <Star className="h-3 w-3 text-warning-500 fill-current" />
                      <span>4.8 rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-secondary-200">
            <div className="px-6 lg:px-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'overview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'care'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  Care Guide
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700'
                  }`}
                >
                  Reviews ({plant.reviewCount})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="px-6 lg:px-8 py-8">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About this plant</h3>
                    <p className="text-secondary-700 leading-relaxed">{plant.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {plant.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-secondary-700">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'care' && careGuide && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-secondary-50 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <Sun className="h-6 w-6 text-warning-500" />
                        <h3 className="text-lg font-semibold">Light Requirements</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">{careGuide.lightNeeds.type}</p>
                        <p className="text-sm text-secondary-600">{careGuide.lightNeeds.hoursPerDay}</p>
                        <p className="text-sm text-secondary-700">{careGuide.lightNeeds.description}</p>
                      </div>
                    </div>

                    <div className="bg-secondary-50 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <Droplets className="h-6 w-6 text-blue-500" />
                        <h3 className="text-lg font-semibold">Watering Guide</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium">{careGuide.watering.frequency}</p>
                        <p className="text-sm text-secondary-600">{careGuide.watering.amount}</p>
                        <p className="text-sm text-secondary-700">{careGuide.watering.description}</p>
                      </div>
                    </div>

                    <div className="bg-secondary-50 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <Thermometer className="h-6 w-6 text-error-500" />
                        <h3 className="text-lg font-semibold">Climate Needs</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium">Temperature:</span> {careGuide.climate.temperature}</p>
                        <p className="text-sm"><span className="font-medium">Humidity:</span> {careGuide.climate.humidity}</p>
                        <p className="text-sm text-secondary-700">{careGuide.climate.seasonalAdjustments}</p>
                      </div>
                    </div>

                    <div className="bg-secondary-50 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <Flower className="h-6 w-6 text-primary-500" />
                        <h3 className="text-lg font-semibold">Fertilization</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium">Type:</span> {careGuide.fertilization.type}</p>
                        <p className="text-sm"><span className="font-medium">Frequency:</span> {careGuide.fertilization.frequency}</p>
                        <p className="text-sm"><span className="font-medium">Season:</span> {careGuide.fertilization.season}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-warning-50 border border-warning-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-warning-800 mb-3">Common Issues</h3>
                    <ul className="space-y-2">
                      {careGuide.commonIssues.map((issue, index) => (
                        <li key={index} className="flex items-start space-x-2 text-warning-700">
                          <div className="w-2 h-2 bg-warning-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!careGuide.toxicity.petSafe && (
                    <div className="bg-error-50 border border-error-200 p-6 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <AlertTriangle className="h-6 w-6 text-error-600" />
                        <h3 className="text-lg font-semibold text-error-800">Pet Safety Warning</h3>
                      </div>
                      <ul className="space-y-2">
                        {careGuide.toxicity.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start space-x-2 text-error-700">
                            <div className="w-2 h-2 bg-error-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-primary-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-primary-800 mb-4">Cultural Significance</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-primary-700 mb-2">Cultural Background</h4>
                        <p className="text-primary-700 text-sm">{careGuide.significance.cultural}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary-700 mb-2">Symbolic Meaning</h4>
                        <p className="text-primary-700 text-sm">{careGuide.significance.symbolic}</p>
                      </div>
                      {careGuide.significance.airPurifying && (
                        <div>
                          <h4 className="font-medium text-primary-700 mb-2">Air Purification</h4>
                          <p className="text-primary-700 text-sm">This plant helps improve indoor air quality by filtering common household toxins.</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-primary-700 mb-2">Feng Shui</h4>
                        <p className="text-primary-700 text-sm">{careGuide.significance.fengShui}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    <button className="px-4 py-2 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                      Write a Review
                    </button>
                  </div>

                  {/* Review Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-secondary-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-secondary-900 mb-2">{plant.rating}</div>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(plant.rating) ? 'text-warning-500 fill-current' : 'text-secondary-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-secondary-600">Based on {plant.reviewCount} reviews</p>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center space-x-2">
                          <span className="text-sm w-8">{rating}★</span>
                          <div className="flex-1 bg-secondary-200 rounded-full h-2">
                            <div 
                              className="bg-warning-400 h-2 rounded-full" 
                              style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 5}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-secondary-600 w-8">
                            {rating === 5 ? 70 : rating === 4 ? 20 : 5}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-6">
                    {[
                      {
                        name: "Sarah Johnson",
                        rating: 5,
                        date: "2024-01-15",
                        review: "Absolutely love this plant! It arrived in perfect condition and has been thriving in my living room. The care instructions were spot on, and it's already showing new growth.",
                        helpful: 12
                      },
                      {
                        name: "Mike Chen",
                        rating: 4,
                        date: "2024-01-10",
                        review: "Great plant and fast shipping. The packaging was excellent - no damage at all. Only minor issue was it was slightly smaller than expected, but it's growing well.",
                        helpful: 8
                      },
                      {
                        name: "Emily Rodriguez",
                        rating: 5,
                        date: "2024-01-05",
                        review: "This is my third purchase from this seller. Consistently high quality plants and excellent customer service. Highly recommend!",
                        helpful: 15
                      }
                    ].map((review, index) => (
                      <div key={index} className="border-b border-secondary-200 pb-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-secondary-900">{review.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-warning-500 fill-current' : 'text-secondary-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-secondary-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-secondary-700 mb-3">{review.review}</p>
                        <button className="text-sm text-secondary-500 hover:text-secondary-700">
                          Helpful ({review.helpful})
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Plants */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockPlants.filter(p => p.id !== plant.id && p.category === plant.category).slice(0, 4).map(relatedPlant => (
              <Link key={relatedPlant.id} to={`/plant/${relatedPlant.id}`} className="group">
                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="aspect-square bg-secondary-100">
                    <img
                      src={relatedPlant.images[0]}
                      alt={relatedPlant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
                      {relatedPlant.name}
                    </h3>
                    <p className="text-sm text-secondary-500 mb-2">{relatedPlant.botanicalName}</p>
                    <p className="font-semibold text-secondary-900">${relatedPlant.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};