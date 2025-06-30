import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Cart } from './components/Cart';
import { Home } from './pages/Home';
import { PlantDetails } from './pages/PlantDetails';
import { GlobalMarketplace } from './pages/GlobalMarketplace';
import { Sellers } from './pages/Sellers';
import { Profile } from './pages/Profile';
import { PlantMatcher } from './pages/PlantMatcher';
import { PlantDesignGallery } from './pages/PlantDesignGallery';
import { SignUp } from './pages/SignUp';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { SellerLogin } from './pages/SellerLogin';
import { SellerSignup } from './pages/SellerSignup';
import { SellerDashboard } from './pages/SellerDashboard';
import { SellerPlantNew } from './pages/SellerPlantNew';
import { SellerPlantList } from './pages/SellerPlantList';
import { SellerPlantEdit } from './pages/SellerPlantEdit';
import { CareRemindersSettings } from './pages/CareRemindersSettings';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { CheckoutCancel } from './pages/CheckoutCancel';
import { useCart } from './hooks/useCart';
import { SellerSubscription } from './pages/SellerSubscription';

function App() {
  const {
    cartItems,
    isOpen: isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemsCount,
    toggleCart,
    setIsOpen: setIsCartOpen
  } = useCart();

  const [searchQuery, setSearchQuery] = React.useState('');

  const handleViewPlantDetails = (plantId: string) => {
    console.log('View plant details:', plantId);
  };

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/seller/login" element={<SellerLogin />} />
              <Route path="/seller/signup" element={<SellerSignup />} />
              
              {/* Checkout Routes */}
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              
              {/* Protected Seller Routes */}
              <Route 
                path="/seller/dashboard" 
                element={
                  <ProtectedRoute requireRole="seller">
                    <SellerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/seller/plants/new" 
                element={
                  <ProtectedRoute requireRole="seller">
                    <SellerPlantNew />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/seller/plants" 
                element={
                  <ProtectedRoute requireRole="seller">
                    <SellerPlantList />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/seller/plants/edit/:id" 
                element={
                  <ProtectedRoute requireRole="seller">
                    <SellerPlantEdit />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/seller/subscription" 
                element={
                  <ProtectedRoute requireRole="seller">
                    <SellerSubscription />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Care Reminders Route */}
              <Route 
                path="/care-reminders" 
                element={
                  <ProtectedRoute>
                    <CareRemindersSettings />
                  </ProtectedRoute>
                } 
              />
              
              {/* Main App Routes - With Header */}
              <Route path="/*" element={
                <>
                  <Header
                    cartItemsCount={getCartItemsCount()}
                    onCartToggle={toggleCart}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                  
                  <main>
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <Home
                            onAddToCart={addToCart}
                            onViewPlantDetails={handleViewPlantDetails}
                          />
                        }
                      />
                      <Route
                        path="/marketplace"
                        element={
                          <GlobalMarketplace
                            onAddToCart={addToCart}
                            onViewPlantDetails={handleViewPlantDetails}
                            searchQuery={searchQuery}
                          />
                        }
                      />
                      <Route
                        path="/plant/:id"
                        element={
                          <PlantDetails
                            onAddToCart={addToCart}
                          />
                        }
                      />
                      <Route path="/sellers" element={<Sellers />} />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/plant-matcher" element={<PlantMatcher />} />
                      <Route 
                        path="/design-gallery" 
                        element={<PlantDesignGallery />}
                      />
                    </Routes>
                  </main>

                  <Cart
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    cartItems={cartItems}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    total={getCartTotal()}
                  />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;