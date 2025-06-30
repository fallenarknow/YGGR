import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  ListFilter,
  Plus,
  Search,
  Leaf,
  Package,
  TrendingUp,
  Users,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  ChevronRight,
  Calendar,
  Clock,
  DollarSign,
  ShoppingCart,
  Truck,
  CheckCircle,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../lib/supabase';
import { SellerSubscriptionBanner, SellerFeatureLimitWarning } from '../components/SellerSubscriptionBanner';

export const SellerDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { currentPlan, planFeatures } = useSubscription();
  const [plants, setPlants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    totalPlants: 0,
    viewsToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch plants
        const { data: plantsData, error: plantsError } = await supabase
          .from('plants')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (plantsError) throw plantsError;
        setPlants(plantsData || []);

        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);

        // Calculate stats
        setStats({
          totalSales: ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
          pendingOrders: ordersData?.filter(order => order.status === 'pending').length || 0,
          totalPlants: plantsData?.length || 0,
          viewsToday: plantsData?.reduce((sum, plant) => sum + (plant.views || 0), 0) || 0
        });
      } catch (error) {
        console.error('Error fetching seller data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Seller Dashboard</h1>
            <p className="text-secondary-600">
              Welcome back, {profile?.business_name || profile?.full_name}!
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <Link
              to="/seller/subscription"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Crown className="h-5 w-5" />
              <span>{planFeatures.name} Plan</span>
            </Link>
            
            <Link
              to="/marketplace"
              className="px-4 py-2 bg-white border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50 transition-colors"
            >
              View Marketplace
            </Link>
          </div>
        </div>

        {/* Subscription Banner */}
        <SellerFeatureLimitWarning
          feature="Plant Listings"
          current={stats.totalPlants}
          limit={planFeatures.limits.plantListings}
          className="mb-6"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-secondary-600 font-medium">Total Sales</h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-secondary-900 mb-1">₹{stats.totalSales.toFixed(2)}</div>
            <p className="text-sm text-green-600">+12% from last month</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-secondary-600 font-medium">Pending Orders</h3>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-secondary-900 mb-1">{stats.pendingOrders}</div>
            <p className="text-sm text-secondary-600">Needs your attention</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-secondary-600 font-medium">Total Plants</h3>
              <div className="p-2 bg-primary-100 rounded-lg">
                <Leaf className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-secondary-900 mb-1">{stats.totalPlants}</div>
            <p className="text-sm text-secondary-600">
              {planFeatures.limits.plantListings === Infinity 
                ? 'Unlimited listings' 
                : `${stats.totalPlants}/${planFeatures.limits.plantListings} listings used`}
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-secondary-600 font-medium">Views Today</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-secondary-900 mb-1">{stats.viewsToday}</div>
            <p className="text-sm text-blue-600">+5% from yesterday</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <h2 className="text-lg font-semibold text-secondary-900">Recent Orders</h2>
                <Link
                  to="/seller/orders"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              {orders.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="h-8 w-8 text-secondary-400" />
                  </div>
                  <h3 className="text-secondary-900 font-medium mb-1">No Orders Yet</h3>
                  <p className="text-secondary-600 text-sm mb-4">
                    When customers place orders, they'll appear here.
                  </p>
                  <Link
                    to="/seller/plants/new"
                    className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Your First Plant</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-secondary-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                            #{order.id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                            {order.customer_name || 'Anonymous'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                            ₹{order.total_amount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Plant Inventory */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <h2 className="text-lg font-semibold text-secondary-900">Plant Inventory</h2>
                <div className="flex items-center space-x-2">
                  <SellerSubscriptionBanner feature="plantListings" quantity={stats.totalPlants + 1} />
                  <Link
                    to="/seller/plants"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              {plants.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="h-8 w-8 text-secondary-400" />
                  </div>
                  <h3 className="text-secondary-900 font-medium mb-1">No Plants Listed</h3>
                  <p className="text-secondary-600 text-sm mb-4">
                    Start adding plants to your inventory to sell them.
                  </p>
                  <Link
                    to="/seller/plants/new"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Plant</span>
                  </Link>
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
                          Views
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {plants.map((plant) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                            ₹{plant.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                            {plant.stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              plant.status === 'active' ? 'bg-green-100 text-green-800' :
                              plant.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-secondary-100 text-secondary-800'
                            }`}>
                              {plant.status.charAt(0).toUpperCase() + plant.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                            {plant.views || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Subscription Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-secondary-900">Subscription</h2>
                <Link
                  to="/seller/subscription"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Manage
                </Link>
              </div>
              
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-500 rounded-lg text-white">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary-800">{planFeatures.name} Plan</h3>
                    <p className="text-sm text-primary-600">{planFeatures.price}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600">Plant Listings</span>
                  <span className="font-medium text-secondary-900">
                    {stats.totalPlants} / {planFeatures.limits.plantListings === Infinity ? '∞' : planFeatures.limits.plantListings}
                  </span>
                </div>
                
                <div className="w-full bg-secondary-100 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full" 
                    style={{ 
                      width: `${planFeatures.limits.plantListings === Infinity 
                        ? 100 
                        : Math.min((stats.totalPlants / planFeatures.limits.plantListings) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600">Locations</span>
                  <span className="font-medium text-secondary-900">
                    0 / {planFeatures.limits.locations === Infinity ? '∞' : planFeatures.limits.locations}
                  </span>
                </div>
                
                <div className="w-full bg-secondary-100 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full" 
                    style={{ width: '0%' }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600">Analytics</span>
                  <span className="font-medium text-secondary-900 capitalize">
                    {planFeatures.limits.analytics}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600">Featured Listings</span>
                  <span className="font-medium text-secondary-900">
                    {planFeatures.limits.featured ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </span>
                </div>
              </div>
              
              {currentPlan !== 'enterprise_plan' && (
                <div className="mt-4">
                  <Link
                    to="/seller/subscription"
                    className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    Upgrade Plan
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  to="/seller/plants/new"
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-secondary-900">Add New Plant</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-secondary-400" />
                </Link>
                
                <Link
                  to="/seller/orders"
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-secondary-900">Manage Orders</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-secondary-400" />
                </Link>
                
                <Link
                  to="/seller/analytics"
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-secondary-900">View Analytics</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-secondary-400" />
                </Link>
                
                <Link
                  to="/seller/settings"
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      <Settings className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-secondary-900">Account Settings</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-secondary-400" />
                </Link>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">Help & Support</h2>
              
              <div className="space-y-4">
                <a
                  href="#"
                  className="flex items-center space-x-3 text-secondary-700 hover:text-primary-600 transition-colors"
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>Seller FAQ</span>
                </a>
                
                <a
                  href="#"
                  className="flex items-center space-x-3 text-secondary-700 hover:text-primary-600 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span>Contact Support</span>
                </a>
                
                <a
                  href="#"
                  className="flex items-center space-x-3 text-secondary-700 hover:text-primary-600 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};