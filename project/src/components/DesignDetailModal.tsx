import React, { useState } from 'react';
import { X, Heart, Share2, Bookmark, MapPin, Phone, Navigation, Star, Clock, Lightbulb, ShoppingCart, MessageCircle, User, Calendar, DollarSign, Leaf, Sun, Droplets, Shield, AlertTriangle, Camera, Search } from 'lucide-react';
import { DesignInspiration } from '../types';

interface DesignDetailModalProps {
  design: DesignInspiration;
  onClose: () => void;
  onSave: () => void;
  isSaved: boolean;
}

export const DesignDetailModal: React.FC<DesignDetailModalProps> = ({
  design,
  onClose,
  onSave,
  isSaved
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plants' | 'stores' | 'community'>('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reservationStore, setReservationStore] = useState<any | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationData, setReservationData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<any | null>(null);
  const [showPlantFinder, setShowPlantFinder] = useState(false);

  // Mock local stores data
  const mockStores = [
    {
      id: 'store1',
      name: 'Green Paradise Nursery',
      distance: '2.3 km',
      rating: 4.8,
      reviewCount: 127,
      phone: '+1 (555) 123-4567',
      availability: 'In Stock',
      price: design.estimatedCost.min,
      deliveryTime: '2-3 hours',
      address: '123 Garden Street, Portland, OR 97201',
      latitude: 45.5231,
      longitude: -122.6765,
      plantsInStock: ['Monstera Deliciosa', 'Snake Plant', 'Fiddle Leaf Fig', 'Pothos Golden']
    },
    {
      id: 'store2',
      name: 'Urban Jungle Co.',
      distance: '4.1 km',
      rating: 4.6,
      reviewCount: 89,
      phone: '+1 (555) 234-5678',
      availability: 'Limited Stock',
      price: design.estimatedCost.min + 20,
      deliveryTime: '3-4 hours',
      address: '456 Plant Avenue, Portland, OR 97209',
      latitude: 45.5252,
      longitude: -122.6835,
      plantsInStock: ['Pothos Golden', 'Snake Plant', 'ZZ Plant', 'Peace Lily']
    },
    {
      id: 'store3',
      name: 'Bloom & Grow',
      distance: '6.8 km',
      rating: 4.7,
      reviewCount: 156,
      phone: '+1 (555) 345-6789',
      availability: 'In Stock',
      price: design.estimatedCost.max,
      deliveryTime: '4-5 hours',
      address: '789 Flower Lane, Portland, OR 97214',
      latitude: 45.5120,
      longitude: -122.6587,
      plantsInStock: ['Fiddle Leaf Fig', 'Monstera Deliciosa', 'Rubber Plant', 'Areca Palm']
    }
  ];

  const mockComments = [
    {
      id: 1,
      user: 'Sarah M.',
      avatar: '👩‍🦰',
      comment: 'This is exactly what I was looking for! Just recreated this in my living room and it looks amazing.',
      likes: 12,
      timeAgo: '2 days ago'
    },
    {
      id: 2,
      user: 'Mike Chen',
      avatar: '👨‍💼',
      comment: 'Love the minimalist approach. Where did you get those white planters?',
      likes: 8,
      timeAgo: '1 week ago'
    },
    {
      id: 3,
      user: 'Emma K.',
      avatar: '👩‍🎨',
      comment: 'Perfect for beginners! The care instructions are so helpful.',
      likes: 15,
      timeAgo: '2 weeks ago'
    }
  ];

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

  const handleReservePlants = (store: any) => {
    setReservationStore(store);
    setShowReservationForm(true);
  };

  const handleCallStore = (phone: string) => {
    // Use the tel: protocol to initiate a phone call
    window.location.href = `tel:${phone}`;
  };

  const handleGetDirections = (store: any) => {
    // Open Google Maps with the store's location
    const address = encodeURIComponent(store.address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    
    // Alternatively, if we have coordinates:
    // const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    
    window.open(mapsUrl, '_blank');
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setReservationSuccess(true);
      
      // Reset form after a delay
      setTimeout(() => {
        setShowReservationForm(false);
        setReservationStore(null);
        setReservationSuccess(false);
        setReservationData({
          name: '',
          phone: '',
          email: '',
          date: '',
          time: '',
          notes: ''
        });
      }, 3000);
    }, 1500);
  };

  // Generate available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Generate time slots
  const getTimeSlots = () => {
    return [
      '10:00 AM - 11:00 AM',
      '11:00 AM - 12:00 PM',
      '12:00 PM - 1:00 PM',
      '2:00 PM - 3:00 PM',
      '3:00 PM - 4:00 PM',
      '4:00 PM - 5:00 PM'
    ];
  };

  // Find stores that have a specific plant in stock
  const findStoresWithPlant = (plantName: string) => {
    return mockStores.filter(store => 
      store.plantsInStock.some(plant => 
        plant.toLowerCase().includes(plantName.toLowerCase())
      )
    );
  };

  // Handle plant finder click
  const handleFindPlant = (plant: any) => {
    setSelectedPlant(plant);
    setShowPlantFinder(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-2xl font-bold text-secondary-900">{design.title}</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={onSave}
              className={`p-2 rounded-lg transition-colors ${
                isSaved ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-600 hover:text-primary-600'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 bg-secondary-100 text-secondary-600 rounded-lg hover:text-primary-600 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-secondary-100 text-secondary-600 rounded-lg hover:text-secondary-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Left Column - Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-secondary-100 rounded-xl overflow-hidden">
                <img
                  src={design.images[currentImageIndex]}
                  alt={design.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {design.images.length > 1 && (
                <div className="flex space-x-2">
                  {design.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index ? 'border-primary-500' : 'border-secondary-200'
                      }`}
                    >
                      <img src={image} alt={`${design.title} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <div className="flex items-center space-x-6 text-sm text-secondary-600">
                  <span className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{design.likes} likes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{design.comments} comments</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
                {design.featured && (
                  <span className="px-2 py-1 bg-accent-500 text-white text-xs rounded-full">Featured</span>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <p className="text-secondary-700 leading-relaxed">{design.description}</p>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-secondary-900 mb-3">Style & Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(design.categories).map(([category, values]) =>
                    values.map(value => (
                      <span
                        key={`${category}-${value}`}
                        className={`px-3 py-1 rounded-full text-sm ${
                          category === 'room' ? 'bg-primary-100 text-primary-700' :
                          category === 'style' ? 'bg-accent-100 text-accent-700' :
                          category === 'plantType' ? 'bg-green-100 text-green-700' :
                          'bg-secondary-100 text-secondary-700'
                        }`}
                      >
                        {value}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Cost Estimate */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Estimated Cost</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  ${design.estimatedCost.min} - ${design.estimatedCost.max}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Includes plants, pots, and basic accessories
                </p>
              </div>

              {/* Tabs */}
              <div className="border-b border-secondary-200">
                <nav className="flex space-x-8">
                  {[
                    { id: 'overview', label: 'Overview', icon: Lightbulb },
                    { id: 'plants', label: 'Plants', icon: Leaf },
                    { id: 'stores', label: 'Find Locally', icon: MapPin },
                    { id: 'community', label: 'Community', icon: MessageCircle }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-3 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-secondary-500 hover:text-secondary-700'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-3">Design Tips</h4>
                      <ul className="space-y-2">
                        {design.designTips.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-secondary-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-3">Pot Recommendations</h4>
                      <ul className="space-y-2">
                        {design.potRecommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-accent-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-secondary-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-secondary-900 mb-3">Complementary Plants</h4>
                      <ul className="space-y-2">
                        {design.complementaryPlants.map((plant, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-secondary-700">{plant}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'plants' && (
                  <div className="space-y-4">
                    {design.plantDetails.map((plant, index) => (
                      <div key={index} className="bg-secondary-50 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-secondary-900 mb-2">{plant.name}</h4>
                            <p className="text-sm text-secondary-600 italic mb-3">{plant.botanicalName}</p>
                          </div>
                          <button 
                            onClick={() => handleFindPlant(plant)}
                            className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm flex items-center space-x-1 hover:bg-primary-700 transition-colors"
                          >
                            <Search className="h-3 w-3" />
                            <span>Find This Plant</span>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-lg mb-1">{getCareIcon(plant.careLevel)}</div>
                            <div className="text-xs text-secondary-600">Care: {plant.careLevel}/5</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg mb-1">{getLightIcon(plant.lightRequirement)}</div>
                            <div className="text-xs text-secondary-600 capitalize">{plant.lightRequirement}</div>
                          </div>
                          <div className="text-center">
                            <Droplets className={`h-4 w-4 mx-auto mb-1 ${
                              plant.wateringFrequency === 'high' ? 'text-blue-500' :
                              plant.wateringFrequency === 'medium' ? 'text-blue-400' : 'text-blue-300'
                            }`} />
                            <div className="text-xs text-secondary-600 capitalize">{plant.wateringFrequency}</div>
                          </div>
                          <div className="text-center">
                            {plant.petSafe ? (
                              <Shield className="h-4 w-4 mx-auto mb-1 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                            )}
                            <div className="text-xs text-secondary-600">
                              {plant.petSafe ? 'Pet Safe' : 'Not Pet Safe'}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-secondary-700 mb-2">Benefits:</h5>
                          <div className="flex flex-wrap gap-1">
                            {plant.benefits.map((benefit, benefitIndex) => (
                              <span key={benefitIndex} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'stores' && (
                  <div className="space-y-4">
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                      <h4 className="font-semibold text-primary-800 mb-2">Find These Plants Near You</h4>
                      <p className="text-sm text-primary-700">
                        Local shops with availability and pricing for this design's plants
                      </p>
                    </div>

                    {mockStores.map((store) => (
                      <div key={store.id} className="bg-white border border-secondary-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-secondary-900">{store.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-secondary-600 mt-1">
                              <span className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{store.distance} away</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span>{store.rating} ({store.reviewCount})</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{store.deliveryTime}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-secondary-900">From ${store.price}</div>
                            <div className={`text-sm font-medium ${
                              store.availability === 'In Stock' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {store.availability}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleReservePlants(store)}
                            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Reserve Plants</span>
                          </button>
                          <button 
                            onClick={() => handleCallStore(store.phone)}
                            className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:border-primary-500 transition-colors flex items-center space-x-2"
                          >
                            <Phone className="h-4 w-4" />
                            <span>Call</span>
                          </button>
                          <button 
                            onClick={() => handleGetDirections(store)}
                            className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:border-primary-500 transition-colors flex items-center space-x-2"
                          >
                            <Navigation className="h-4 w-4" />
                            <span>Directions</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'community' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-secondary-900">Community Feedback</h4>
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                        Add Comment
                      </button>
                    </div>

                    <div className="space-y-4">
                      {mockComments.map((comment) => (
                        <div key={comment.id} className="bg-secondary-50 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-lg">
                              {comment.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-secondary-900">{comment.user}</span>
                                <span className="text-sm text-secondary-500">{comment.timeAgo}</span>
                              </div>
                              <p className="text-secondary-700 mb-2">{comment.comment}</p>
                              <div className="flex items-center space-x-4 text-sm text-secondary-500">
                                <button className="flex items-center space-x-1 hover:text-primary-600 transition-colors">
                                  <Heart className="h-4 w-4" />
                                  <span>{comment.likes}</span>
                                </button>
                                <button className="hover:text-primary-600 transition-colors">Reply</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Recreate This Look</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Share your version of this design and inspire others!
                      </p>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2">
                        <Camera className="h-4 w-4" />
                        <span>Upload Your Photo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plant Finder Modal */}
      {showPlantFinder && selectedPlant && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary-900">Find "{selectedPlant.name}" Near You</h3>
              <button
                onClick={() => {
                  setShowPlantFinder(false);
                  setSelectedPlant(null);
                }}
                className="p-2 bg-secondary-100 text-secondary-600 rounded-lg hover:text-secondary-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  {getCareIcon(selectedPlant.careLevel)}
                </div>
                <div>
                  <h4 className="font-medium text-primary-800 mb-1">{selectedPlant.name}</h4>
                  <p className="text-sm text-primary-600 italic mb-2">{selectedPlant.botanicalName}</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPlant.benefits.map((benefit: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-medium text-secondary-900 mb-4">Stores with this plant in stock:</h4>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {findStoresWithPlant(selectedPlant.name).length > 0 ? (
                findStoresWithPlant(selectedPlant.name).map((store) => (
                  <div key={store.id} className="bg-white border border-secondary-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-secondary-900">{store.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-secondary-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{store.distance} away</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{store.rating} ({store.reviewCount})</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-secondary-900">From ${store.price}</div>
                        <div className="text-sm font-medium text-green-600">In Stock</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => {
                          setShowPlantFinder(false);
                          handleReservePlants(store);
                        }}
                        className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Reserve Plant</span>
                      </button>
                      <button 
                        onClick={() => handleCallStore(store.phone)}
                        className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:border-primary-500 transition-colors flex items-center space-x-2"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call</span>
                      </button>
                      <button 
                        onClick={() => handleGetDirections(store)}
                        className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:border-primary-500 transition-colors flex items-center space-x-2"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Directions</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="h-8 w-8 text-secondary-400" />
                  </div>
                  <h3 className="text-secondary-900 font-medium mb-1">No Stores Found</h3>
                  <p className="text-secondary-600 text-sm">
                    We couldn't find any local stores with {selectedPlant.name} in stock.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-secondary-200">
              <button
                onClick={() => {
                  setShowPlantFinder(false);
                  setSelectedPlant(null);
                }}
                className="w-full px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Form Modal */}
      {showReservationForm && reservationStore && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {reservationSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">Reservation Confirmed!</h3>
                <p className="text-secondary-600 mb-6">
                  Your plants have been reserved at {reservationStore.name}. They'll contact you shortly to confirm your reservation.
                </p>
                <button
                  onClick={() => {
                    setShowReservationForm(false);
                    setReservationStore(null);
                    setReservationSuccess(false);
                  }}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-secondary-900">Reserve Plants</h3>
                  <button
                    onClick={() => {
                      setShowReservationForm(false);
                      setReservationStore(null);
                    }}
                    className="p-2 bg-secondary-100 text-secondary-600 rounded-lg hover:text-secondary-900 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="bg-primary-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-primary-800 mb-2">{reservationStore.name}</h4>
                  <p className="text-sm text-primary-600 mb-1">{reservationStore.address}</p>
                  <div className="flex items-center space-x-4 text-sm text-primary-600">
                    <span className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{reservationStore.phone}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{reservationStore.distance} away</span>
                    </span>
                  </div>
                </div>

                <form onSubmit={handleReservationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={reservationData.name}
                      onChange={(e) => setReservationData({...reservationData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={reservationData.phone}
                        onChange={(e) => setReservationData({...reservationData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={reservationData.email}
                        onChange={(e) => setReservationData({...reservationData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Pickup Date
                    </label>
                    <select
                      value={reservationData.date}
                      onChange={(e) => setReservationData({...reservationData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a date</option>
                      {getAvailableDates().map((date) => {
                        const d = new Date(date);
                        const formattedDate = d.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        });
                        return (
                          <option key={date} value={date}>
                            {formattedDate}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Pickup Time
                    </label>
                    <select
                      value={reservationData.time}
                      onChange={(e) => setReservationData({...reservationData, time: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a time</option>
                      {getTimeSlots().map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={reservationData.notes}
                      onChange={(e) => setReservationData({...reservationData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                    <p className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        This will reserve the plants for 48 hours. Payment will be made in-store during pickup.
                      </span>
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReservationForm(false);
                        setReservationStore(null);
                      }}
                      className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>Confirm Reservation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};