import React, { useState, useMemo } from 'react';
import { Search, Filter, Grid, Heart, MessageCircle, Eye, Bookmark, Share2, MapPin, Star, Clock, Sparkles, Camera, Lightbulb, Home, Palette, Leaf, TrendingUp, X, ChevronDown, Upload, Plus } from 'lucide-react';
import { mockDesignInspirations } from '../data/mockData';
import { DesignInspiration } from '../types';
import { DesignDetailModal } from '../components/DesignDetailModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const PlantDesignGallery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    room: [],
    style: [],
    plantType: [],
    difficulty: []
  });
  const [sortBy, setSortBy] = useState('featured');
  const [selectedDesign, setSelectedDesign] = useState<DesignInspiration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<string[]>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    room: '',
    style: '',
    plantType: '',
    difficulty: '',
    estimatedCostMin: '',
    estimatedCostMax: '',
    designTips: [''],
    images: [] as File[]
  });
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useAuth();

  const filterCategories = {
    room: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room', 'Courtyard', 'Garden'],
    style: ['Minimalist', 'Boho', 'Modern', 'Vintage', 'Spa', 'Statement', 'Tropical', 'Traditional'],
    plantType: ['Floor Plants', 'Desktop Plants', 'Hanging Plants', 'Herbs', 'Air Purifying', 'Vertical Gardens', 'Humidity-Loving', 'Tropical Plants', 'Edible Plants'],
    difficulty: ['Beginner-Friendly', 'Moderate Care', 'High Maintenance', 'Low Maintenance']
  };

  const filteredAndSortedDesigns = useMemo(() => {
    let filtered = mockDesignInspirations.filter(design => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!design.title.toLowerCase().includes(query) &&
            !design.description.toLowerCase().includes(query) &&
            !design.plantDetails.some(plant => plant.name.toLowerCase().includes(query))) {
          return false;
        }
      }

      // Category filters
      for (const [category, selectedValues] of Object.entries(selectedFilters)) {
        if (selectedValues.length > 0) {
          const designCategories = design.categories[category] || [];
          if (!selectedValues.some(value => designCategories.includes(value))) {
            return false;
          }
        }
      }

      return true;
    });

    // Sort
    switch (sortBy) {
      case 'featured':
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.likes - a.likes;
        });
        break;
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'budget-low':
        filtered.sort((a, b) => a.estimatedCost.min - b.estimatedCost.min);
        break;
      case 'budget-high':
        filtered.sort((a, b) => b.estimatedCost.max - a.estimatedCost.max);
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedFilters, sortBy]);

  const handleFilterToggle = (category: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleDesignClick = (design: DesignInspiration) => {
    setSelectedDesign(design);
    setIsModalOpen(true);
  };

  const handleSaveDesign = (designId: string) => {
    if (!user) {
      // For non-logged in users, just use local state
      setSavedDesigns(prev => 
        prev.includes(designId) 
          ? prev.filter(id => id !== designId)
          : [...prev, designId]
      );
      return;
    }
    
    // For logged in users, we could save to the database
    setSavedDesigns(prev => 
      prev.includes(designId) 
        ? prev.filter(id => id !== designId)
        : [...prev, designId]
    );
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      room: [],
      style: [],
      plantType: [],
      difficulty: []
    });
    setSearchQuery('');
  };

  const handleUploadDesign = () => {
    if (!user) {
      alert('Please login to upload designs');
      return;
    }
    setShowUploadModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    }
  };

  const removeImage = (index: number) => {
    setUploadData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addDesignTip = () => {
    setUploadData(prev => ({
      ...prev,
      designTips: [...prev.designTips, '']
    }));
  };

  const updateDesignTip = (index: number, value: string) => {
    setUploadData(prev => ({
      ...prev,
      designTips: prev.designTips.map((tip, i) => i === index ? value : tip)
    }));
  };

  const removeDesignTip = (index: number) => {
    setUploadData(prev => ({
      ...prev,
      designTips: prev.designTips.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);

    try {
      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      
      for (const image of uploadData.images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `design-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('plants-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('plants-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // Save design to database
      const designData = {
        user_id: user.id,
        title: uploadData.title,
        description: uploadData.description,
        images: imageUrls,
        categories_room: [uploadData.room],
        categories_style: [uploadData.style],
        categories_plant_type: [uploadData.plantType],
        categories_difficulty: [uploadData.difficulty],
        estimated_cost_min: parseFloat(uploadData.estimatedCostMin) || 0,
        estimated_cost_max: parseFloat(uploadData.estimatedCostMax) || 0,
        design_tips: uploadData.designTips.filter(tip => tip.trim() !== ''),
        user_generated: true,
        featured: false
      };

      const { error: insertError } = await supabase
        .from('design_inspirations')
        .insert([designData]);

      if (insertError) throw insertError;

      alert('Design uploaded successfully!');
      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        room: '',
        style: '',
        plantType: '',
        difficulty: '',
        estimatedCostMin: '',
        estimatedCostMax: '',
        designTips: [''],
        images: []
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Failed to upload design. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-3 rounded-full">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-secondary-900">Plant Design Gallery</h1>
          </div>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Discover stunning plant arrangements and get inspired to create your perfect green space
          </p>
        </div>

        {/* Search and Controls Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search designs, plants, or styles..."
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center space-x-2 px-6 py-3 border rounded-xl font-medium transition-all duration-200 ${
                isFilterPanelOpen || activeFilterCount > 0
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-300 text-secondary-700 hover:border-primary-300'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="featured">Featured First</option>
              <option value="popular">Most Popular</option>
              <option value="recent">Most Recent</option>
              <option value="budget-low">Budget: Low to High</option>
              <option value="budget-high">Budget: High to Low</option>
            </select>
          </div>

          {/* Collapsible Filter Panel */}
          {isFilterPanelOpen && (
            <div className="mt-6 pt-6 border-t border-secondary-200 animate-slide-up">
              <div className="space-y-6">
                {Object.entries(filterCategories).map(([category, options]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-secondary-700 mb-3 capitalize flex items-center space-x-2">
                      {category === 'room' && <Home className="h-4 w-4" />}
                      {category === 'style' && <Palette className="h-4 w-4" />}
                      {category === 'plantType' && <Leaf className="h-4 w-4" />}
                      {category === 'difficulty' && <TrendingUp className="h-4 w-4" />}
                      <span>{category === 'plantType' ? 'Plant Type' : category}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {options.map(option => (
                        <button
                          key={option}
                          onClick={() => handleFilterToggle(category, option)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedFilters[category].includes(option)
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Active Filters & Clear */}
                {activeFilterCount > 0 && (
                  <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                    <span className="text-sm text-secondary-600">
                      {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                    </span>
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <X className="h-4 w-4" />
                      <span>Clear all filters</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            {filteredAndSortedDesigns.length} design{filteredAndSortedDesigns.length !== 1 ? 's' : ''} found
          </h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleUploadDesign}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Design</span>
            </button>
          </div>
        </div>

        {/* Design Grid */}
        {filteredAndSortedDesigns.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              No designs found
            </h3>
            <p className="text-secondary-600 mb-6">
              Try adjusting your search or filters to discover more plant design inspiration
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredAndSortedDesigns.map(design => (
              <div 
                key={design.id} 
                className="break-inside-avoid bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => handleDesignClick(design)}
              >
                {/* Image Only */}
                <div className="relative overflow-hidden">
                  <img
                    src={design.images[0]}
                    alt={design.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Eye className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">View Details</p>
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {design.featured && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Featured</span>
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveDesign(design.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
                      savedDesigns.includes(design.id)
                        ? 'bg-primary-500 text-white'
                        : 'bg-white/80 text-secondary-600 hover:text-primary-600'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${savedDesigns.includes(design.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Share Your Plant Design</h2>
          <p className="text-xl mb-6 opacity-90">
            Inspire others with your beautiful plant arrangements and join our creative community
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={handleUploadDesign}
              className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="h-5 w-5" />
              <span>Upload Your Design</span>
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors flex items-center justify-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <span>Get Design Tips</span>
            </button>
          </div>
        </div>
      </div>

      {/* Design Detail Modal */}
      {isModalOpen && selectedDesign && (
        <DesignDetailModal
          design={selectedDesign}
          onClose={() => setIsModalOpen(false)}
          onSave={() => handleSaveDesign(selectedDesign.id)}
          isSaved={savedDesigns.includes(selectedDesign.id)}
        />
      )}

      {/* Upload Design Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-secondary-900">Upload Your Design</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-secondary-600 hover:text-secondary-900"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Design Title *
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Give your design a catchy title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your design, inspiration, and tips"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Room *
                    </label>
                    <select
                      value={uploadData.room}
                      onChange={(e) => setUploadData(prev => ({ ...prev, room: e.target.value }))}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select room</option>
                      {filterCategories.room.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Style *
                    </label>
                    <select
                      value={uploadData.style}
                      onChange={(e) => setUploadData(prev => ({ ...prev, style: e.target.value }))}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select style</option>
                      {filterCategories.style.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Plant Type *
                    </label>
                    <select
                      value={uploadData.plantType}
                      onChange={(e) => setUploadData(prev => ({ ...prev, plantType: e.target.value }))}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select plant type</option>
                      {filterCategories.plantType.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Difficulty *
                    </label>
                    <select
                      value={uploadData.difficulty}
                      onChange={(e) => setUploadData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select difficulty</option>
                      {filterCategories.difficulty.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Estimated Cost (Min) ₹
                    </label>
                    <input
                      type="number"
                      value={uploadData.estimatedCostMin}
                      onChange={(e) => setUploadData(prev => ({ ...prev, estimatedCostMin: e.target.value }))}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Estimated Cost (Max) ₹
                    </label>
                    <input
                      type="number"
                      value={uploadData.estimatedCostMax}
                      onChange={(e) => setUploadData(prev => ({ ...prev, estimatedCostMax: e.target.value }))}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="2000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Design Tips
                  </label>
                  {uploadData.designTips.map((tip, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => updateDesignTip(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter a design tip"
                      />
                      {uploadData.designTips.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDesignTip(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDesignTip}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another tip</span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Images *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {uploadData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {uploadData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-6 py-3 border border-secondary-300 text-secondary-700 rounded-xl hover:bg-secondary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !uploadData.title || !uploadData.description || uploadData.images.length === 0}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span>Upload Design</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};