import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Leaf,
  Save,
  Plus,
  X,
  Upload,
  Sun,
  Droplets,
  Shield,
  Home,
  Tag,
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plant } from '../types';

export const SellerPlantEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    botanical_name: '',
    price: '',
    original_price: '',
    description: '',
    category: '',
    size: 'medium',
    care_level: 3,
    light_requirement: 'medium',
    watering_frequency: 'medium',
    pet_safe: false,
    indoor_outdoor: 'indoor',
    stock: 1,
    origin_info: '',
    pot_details: '',
    mature_size_expectations: '',
    growth_rate: '',
    special_features: [''],
    status: 'draft'
  });

  // Categories for dropdown
  const categories = [
    'Indoor Plants',
    'Outdoor Plants',
    'Flowering Plants',
    'Succulents',
    'Cacti',
    'Herbs',
    'Fruit Plants',
    'Vegetable Plants',
    'Bonsai',
    'Air Plants',
    'Aquatic Plants',
    'Ferns',
    'Palms',
    'Trailing Plants',
    'Rare Plants'
  ];

  // Fetch plant data
  useEffect(() => {
    const fetchPlant = async () => {
      if (!user || !id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          throw new Error('Plant not found');
        }
        
        // Check if the plant belongs to the current user
        if (data.seller_id !== user.id) {
          throw new Error('You do not have permission to edit this plant');
        }
        
        setPlant(data);
        
        // Set form data
        setFormData({
          name: data.name,
          botanical_name: data.botanical_name,
          price: data.price.toString(),
          original_price: data.original_price ? data.original_price.toString() : '',
          description: data.description,
          category: data.category,
          size: data.size,
          care_level: data.care_level,
          light_requirement: data.light_requirement,
          watering_frequency: data.watering_frequency,
          pet_safe: data.pet_safe,
          indoor_outdoor: data.indoor_outdoor,
          stock: data.stock,
          origin_info: data.origin_info || '',
          pot_details: data.pot_details || '',
          mature_size_expectations: data.mature_size_expectations || '',
          growth_rate: data.growth_rate || '',
          special_features: data.special_features?.length ? data.special_features : [''],
          status: data.status
        });
        
        // Set existing images
        setExistingImages(data.images || []);
      } catch (error: any) {
        console.error('Error fetching plant:', error);
        setError(error.message || 'Failed to load plant');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlant();
  }, [user, id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecialFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.special_features];
    updatedFeatures[index] = value;
    setFormData(prev => ({ ...prev, special_features: updatedFeatures }));
  };

  const addSpecialFeature = () => {
    setFormData(prev => ({
      ...prev,
      special_features: [...prev.special_features, '']
    }));
  };

  const removeSpecialFeature = (index: number) => {
    const updatedFeatures = formData.special_features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, special_features: updatedFeatures }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setImageUploadError('Only image files are allowed');
      return;
    }
    
    // Validate file size (max 5MB per file)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setImageUploadError('Images must be less than 5MB each');
      return;
    }
    
    // Validate total number of images (max 10)
    if (existingImages.length + images.length + files.length > 10) {
      setImageUploadError('Maximum 10 images allowed');
      return;
    }
    
    setImageUploadError(null);
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Required fields
    if (!formData.name.trim()) return false;
    if (!formData.botanical_name.trim()) return false;
    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) return false;
    if (!formData.description.trim()) return false;
    if (!formData.category) return false;
    if (existingImages.length === 0 && images.length === 0) return false;
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent, publishImmediately = false) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill in all required fields and add at least one image');
      return;
    }
    
    if (!user || !plant) {
      setError('You must be logged in to edit a plant');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Upload new images to Supabase Storage
      const newImageUrls: string[] = [];
      
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `plants/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('plants-images')
          .upload(filePath, image);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('plants-images')
          .getPublicUrl(filePath);
          
        newImageUrls.push(publicUrl);
      }
      
      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];
      
      // Generate alt texts
      const altTexts = allImages.map(() => formData.name);
      
      // Update plant record in database
      const { data, error } = await supabase
        .from('plants')
        .update({
          name: formData.name,
          botanical_name: formData.botanical_name,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          description: formData.description,
          category: formData.category,
          size: formData.size,
          care_level: formData.care_level,
          light_requirement: formData.light_requirement,
          watering_frequency: formData.watering_frequency,
          pet_safe: formData.pet_safe,
          indoor_outdoor: formData.indoor_outdoor,
          stock: parseInt(formData.stock.toString()),
          images: allImages,
          alt_texts: altTexts,
          origin_info: formData.origin_info || null,
          pot_details: formData.pot_details || null,
          mature_size_expectations: formData.mature_size_expectations || null,
          growth_rate: formData.growth_rate || null,
          special_features: formData.special_features.filter(f => f.trim() !== ''),
          status: publishImmediately ? 'active' : formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', plant.id)
        .select();
        
      if (error) throw error;
      
      setSuccess(true);
      
      // Navigate back to plant list after successful submission
      setTimeout(() => {
        navigate('/seller/plants');
      }, 2000);
    } catch (error: any) {
      console.error('Error updating plant:', error);
      setError(error.message || 'Failed to update plant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Loading plant details...</p>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Plant Not Found</h2>
          <p className="text-secondary-600 mb-6">
            The plant you're trying to edit doesn't exist or you don't have permission to edit it.
          </p>
          <Link
            to="/seller/plants"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Plant List</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/seller/plants"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Plant List</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-secondary-900">Edit Plant</h1>
                <p className="text-secondary-600 text-lg">{plant.name}</p>
              </div>
            </div>
            
            <Link
              to={`/plant/${plant.id}`}
              target="_blank"
              className="inline-flex items-center space-x-2 px-6 py-3 border border-primary-500 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors"
            >
              <Eye className="h-5 w-5" />
              <span>View Listing</span>
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3 animate-fade-in">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-green-800 font-medium">Plant updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3 animate-fade-in">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-secondary-900 flex items-center space-x-2">
                    <Info className="h-5 w-5 text-primary-500" />
                    <span>Basic Information</span>
                  </h2>

                  {/* Plant Name */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Plant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Monstera Deliciosa"
                      required
                    />
                  </div>

                  {/* Botanical Name */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Botanical Name *
                    </label>
                    <input
                      type="text"
                      value={formData.botanical_name}
                      onChange={(e) => handleInputChange('botanical_name', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Monstera deliciosa"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Price (₹) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Original Price (₹)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.original_price}
                          onChange={(e) => handleInputChange('original_price', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="mt-1 text-xs text-secondary-500">
                        Leave empty if there's no discount
                      </p>
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Describe your plant, its features, and what makes it special..."
                      required
                    />
                  </div>
                </div>

                {/* Right Column - Care Info & Images */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-secondary-900 flex items-center space-x-2">
                    <Droplets className="h-5 w-5 text-primary-500" />
                    <span>Care Information</span>
                  </h2>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Size
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  {/* Care Level */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Care Level (1-5)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.care_level}
                        onChange={(e) => handleInputChange('care_level', parseInt(e.target.value))}
                        className="flex-1 accent-primary-600"
                      />
                      <span className="text-secondary-700 font-medium w-8 text-center">
                        {formData.care_level}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-secondary-500 mt-1">
                      <span>Easy</span>
                      <span>Medium</span>
                      <span>Difficult</span>
                    </div>
                  </div>

                  {/* Light Requirement */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Light Requirement
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['low', 'medium', 'bright', 'direct'].map(light => (
                        <label
                          key={light}
                          className={`flex items-center justify-center space-x-2 p-3 border rounded-xl cursor-pointer transition-colors ${
                            formData.light_requirement === light
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-secondary-300 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="light_requirement"
                            value={light}
                            checked={formData.light_requirement === light}
                            onChange={(e) => handleInputChange('light_requirement', e.target.value)}
                            className="sr-only"
                          />
                          <Sun className={`h-5 w-5 ${
                            formData.light_requirement === light ? 'text-primary-500' : 'text-secondary-400'
                          }`} />
                          <span className="capitalize">{light}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Watering Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Watering Frequency
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['low', 'medium', 'high'].map(watering => (
                        <label
                          key={watering}
                          className={`flex items-center justify-center space-x-2 p-3 border rounded-xl cursor-pointer transition-colors ${
                            formData.watering_frequency === watering
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-secondary-300 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="watering_frequency"
                            value={watering}
                            checked={formData.watering_frequency === watering}
                            onChange={(e) => handleInputChange('watering_frequency', e.target.value)}
                            className="sr-only"
                          />
                          <Droplets className={`h-5 w-5 ${
                            formData.watering_frequency === watering ? 'text-primary-500' : 'text-secondary-400'
                          }`} />
                          <span className="capitalize">{watering}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Indoor/Outdoor */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Environment
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['indoor', 'outdoor', 'both'].map(environment => (
                        <label
                          key={environment}
                          className={`flex items-center justify-center space-x-2 p-3 border rounded-xl cursor-pointer transition-colors ${
                            formData.indoor_outdoor === environment
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-secondary-300 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="indoor_outdoor"
                            value={environment}
                            checked={formData.indoor_outdoor === environment}
                            onChange={(e) => handleInputChange('indoor_outdoor', e.target.value)}
                            className="sr-only"
                          />
                          <Home className={`h-5 w-5 ${
                            formData.indoor_outdoor === environment ? 'text-primary-500' : 'text-secondary-400'
                          }`} />
                          <span className="capitalize">{environment}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Pet Safe */}
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.pet_safe}
                        onChange={(e) => handleInputChange('pet_safe', e.target.checked)}
                        className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Shield className={`h-5 w-5 ${formData.pet_safe ? 'text-primary-500' : 'text-secondary-400'}`} />
                        <span className="text-sm font-medium text-secondary-700">Pet Safe</span>
                      </div>
                    </label>
                  </div>

                  {/* Special Features */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Special Features
                    </label>
                    {formData.special_features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <Tag className="h-5 w-5 text-secondary-400" />
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleSpecialFeatureChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Air Purifying, Rare, Fast Growing"
                        />
                        {formData.special_features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecialFeature(index)}
                            className="p-2 text-secondary-400 hover:text-secondary-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSpecialFeature}
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="mt-8 pt-8 border-t border-secondary-200">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">Additional Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Origin Information
                    </label>
                    <input
                      type="text"
                      value={formData.origin_info}
                      onChange={(e) => handleInputChange('origin_info', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Native to South America"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Pot Details
                    </label>
                    <input
                      type="text"
                      value={formData.pot_details}
                      onChange={(e) => handleInputChange('pot_details', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Comes in a 6-inch terracotta pot"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Mature Size Expectations
                    </label>
                    <input
                      type="text"
                      value={formData.mature_size_expectations}
                      onChange={(e) => handleInputChange('mature_size_expectations', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Can grow up to 3 feet tall and 2 feet wide"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Growth Rate
                    </label>
                    <select
                      value={formData.growth_rate}
                      onChange={(e) => handleInputChange('growth_rate', e.target.value)}
                      className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select growth rate</option>
                      <option value="Slow">Slow</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Fast">Fast</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-8 pt-8 border-t border-secondary-200">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">Listing Status</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['draft', 'active', 'inactive', 'out_of_stock'].map(status => (
                    <label
                      key={status}
                      className={`flex items-center justify-center space-x-2 p-4 border rounded-xl cursor-pointer transition-colors ${
                        formData.status === status
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-300 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={formData.status === status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="sr-only"
                      />
                      <span className="capitalize">{status.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="mt-8 pt-8 border-t border-secondary-200">
                <h2 className="text-xl font-semibold text-secondary-900 mb-6">Plant Images</h2>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-secondary-700 mb-3">Current Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                      {existingImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-secondary-100 rounded-lg overflow-hidden">
                            <img
                              src={url}
                              alt={`Plant ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Upload New Images
                  </label>
                  <div className="border-2 border-dashed border-secondary-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                      <p className="text-secondary-700 font-medium mb-1">Click to upload images</p>
                      <p className="text-secondary-500 text-sm">
                        PNG, JPG, GIF up to 5MB (max 10 images total)
                      </p>
                    </label>
                  </div>
                  {imageUploadError && (
                    <p className="mt-2 text-sm text-red-600">{imageUploadError}</p>
                  )}
                </div>
                
                {/* New Image Previews */}
                {imageUrls.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-secondary-700 mb-3">New Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-secondary-100 rounded-lg overflow-hidden">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-secondary-50 p-6 sm:p-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/seller/plants')}
                className="px-6 py-3 border border-secondary-300 text-secondary-700 rounded-xl hover:bg-secondary-100 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-secondary-700 text-white rounded-xl hover:bg-secondary-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              
              {formData.status !== 'active' && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Leaf className="h-5 w-5" />
                      <span>Publish Now</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};