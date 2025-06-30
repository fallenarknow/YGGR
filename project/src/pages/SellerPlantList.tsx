import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Leaf,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Archive,
  Tag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plant } from '../types';

export const SellerPlantList: React.FC = () => {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  // Get all unique categories from plants
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set<string>();
    plants.forEach(plant => {
      if (plant.category) {
        uniqueCategories.add(plant.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [plants]);

  useEffect(() => {
    const fetchPlants = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPlants(data || []);
      } catch (error: any) {
        console.error('Error fetching plants:', error);
        setError(error.message || 'Failed to load plants');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlants();
  }, [user]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...plants];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(plant => 
        plant.name.toLowerCase().includes(query) ||
        plant.botanical_name.toLowerCase().includes(query) ||
        plant.description.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(plant => plant.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(plant => plant.category === categoryFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'stock':
          valueA = a.stock;
          valueB = b.stock;
          break;
        case 'views':
          valueA = a.views || 0;
          valueB = b.views || 0;
          break;
        case 'created_at':
        default:
          valueA = new Date(a.created_at).getTime();
          valueB = new Date(b.created_at).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredPlants(result);
  }, [plants, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder]);

  const handleDeleteClick = (plant: Plant) => {
    setPlantToDelete(plant);
    setShowDeleteModal(true);
    setShowActionMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!plantToDelete) return;
    
    setIsDeleting(true);
    try {
      // Delete plant from database
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plantToDelete.id);
        
      if (error) throw error;
      
      // Remove plant from state
      setPlants(plants.filter(p => p.id !== plantToDelete.id));
      setDeleteSuccess(true);
      
      // Close modal after a delay
      setTimeout(() => {
        setShowDeleteModal(false);
        setPlantToDelete(null);
        setDeleteSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting plant:', error);
      setError(error.message || 'Failed to delete plant');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (plantId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('plants')
        .update({ status: newStatus })
        .eq('id', plantId);
        
      if (error) throw error;
      
      // Update plant in state
      setPlants(plants.map(p => 
        p.id === plantId ? { ...p, status: newStatus as any } : p
      ));
    } catch (error: any) {
      console.error('Error updating plant status:', error);
      setError(error.message || 'Failed to update plant status');
    }
  };

  const toggleActionMenu = (plantId: string) => {
    setShowActionMenu(showActionMenu === plantId ? null : plantId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-secondary-100 text-secondary-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Loading your plants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-secondary-900">Plant Inventory</h1>
                <p className="text-secondary-600 text-lg">Manage your plant listings</p>
              </div>
            </div>
            
            <Link
              to="/seller/plants/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Plant</span>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3 animate-fade-in">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="text-sm text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plants by name or description..."
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-secondary-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
              
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="created_at">Date Added</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                  <option value="views">Views</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-3 border border-secondary-300 rounded-xl hover:bg-secondary-50 transition-colors"
                >
                  <ChevronDown className={`h-5 w-5 text-secondary-600 transition-transform ${
                    sortOrder === 'asc' ? 'rotate-180' : ''
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plant List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-lg font-semibold text-secondary-900">
              {filteredPlants.length} {filteredPlants.length === 1 ? 'Plant' : 'Plants'}
            </h2>
          </div>
          
          {filteredPlants.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-10 w-10 text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">No plants found</h3>
              <p className="text-secondary-600 mb-6 max-w-md mx-auto">
                {plants.length === 0
                  ? "You haven't added any plants yet. Start by adding your first plant."
                  : "No plants match your current filters. Try adjusting your search or filters."}
              </p>
              {plants.length === 0 ? (
                <Link
                  to="/seller/plants/new"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Your First Plant</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="px-6 py-3 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Plant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {filteredPlants.map((plant) => (
                    <tr key={plant.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-secondary-100 rounded-lg overflow-hidden">
                            {plant.images && plant.images[0] && (
                              <img 
                                src={plant.images[0]} 
                                alt={plant.name} 
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-secondary-900">{plant.name}</div>
                            <div className="text-xs text-secondary-500">{plant.botanical_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">₹{plant.price}</div>
                        {plant.original_price && (
                          <div className="text-xs text-secondary-500 line-through">₹{plant.original_price}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${plant.stock <= 5 ? 'text-red-600 font-medium' : 'text-secondary-900'}`}>
                          {plant.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plant.status)}`}>
                          {plant.status.charAt(0).toUpperCase() + plant.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                        {formatDate(plant.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                        {plant.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/plant/${plant.id}`}
                            target="_blank"
                            className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                            title="View"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/seller/plants/edit/${plant.id}`}
                            className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(plant)}
                            className="p-2 text-secondary-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => toggleActionMenu(plant.id)}
                              className="p-2 text-secondary-600 hover:text-primary-600 transition-colors"
                              title="More Actions"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            
                            {showActionMenu === plant.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10"
                                  onClick={() => setShowActionMenu(null)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-20">
                                  {plant.status !== 'active' && (
                                    <button
                                      onClick={() => {
                                        handleStatusChange(plant.id, 'active');
                                        setShowActionMenu(null);
                                      }}
                                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-left text-secondary-700 hover:bg-secondary-50"
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      <span>Publish</span>
                                    </button>
                                  )}
                                  {plant.status !== 'draft' && (
                                    <button
                                      onClick={() => {
                                        handleStatusChange(plant.id, 'draft');
                                        setShowActionMenu(null);
                                      }}
                                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-left text-secondary-700 hover:bg-secondary-50"
                                    >
                                      <Archive className="h-4 w-4 text-yellow-500" />
                                      <span>Move to Draft</span>
                                    </button>
                                  )}
                                  {plant.status !== 'inactive' && (
                                    <button
                                      onClick={() => {
                                        handleStatusChange(plant.id, 'inactive');
                                        setShowActionMenu(null);
                                      }}
                                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-left text-secondary-700 hover:bg-secondary-50"
                                    >
                                      <Archive className="h-4 w-4 text-secondary-500" />
                                      <span>Deactivate</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/plant/${plant.id}`);
                                      setShowActionMenu(null);
                                    }}
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-left text-secondary-700 hover:bg-secondary-50"
                                  >
                                    <Copy className="h-4 w-4 text-secondary-500" />
                                    <span>Copy Link</span>
                                  </button>
                                  <Link
                                    to={`/plant/${plant.id}`}
                                    target="_blank"
                                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-left text-secondary-700 hover:bg-secondary-50"
                                  >
                                    <ExternalLink className="h-4 w-4 text-secondary-500" />
                                    <span>Open in New Tab</span>
                                  </Link>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && plantToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {deleteSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-secondary-900 mb-2">Plant Deleted</h3>
                <p className="text-secondary-600 mb-6">
                  The plant has been successfully deleted from your inventory.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2">Delete Plant</h3>
                  <p className="text-secondary-600">
                    Are you sure you want to delete <span className="font-medium">{plantToDelete.name}</span>? This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 border border-secondary-300 text-secondary-700 rounded-xl hover:bg-secondary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-5 w-5" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};