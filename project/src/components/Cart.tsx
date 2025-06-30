import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { CartItem } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (plantId: string, quantity: number) => void;
  onRemoveItem: (plantId: string) => void;
  total: number;
}

export const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  total
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { user } = useAuth();

  if (!isOpen) return null;

  const shippingCost = total > 50 ? 0 : 9.99;
  const finalTotal = total + shippingCost;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    try {
      setIsCheckingOut(true);
      setCheckoutError(null);
      
      // Prepare line items for the checkout
      const lineItems = cartItems.map(item => ({
        id: item.plantId,
        name: item.plant.name,
        description: item.plant.botanical_name,
        image: item.plant.images[0],
        price: Math.round(item.plant.price * 100), // Convert to paise
        quantity: item.quantity
      }));
      
      // Add shipping as a line item if applicable
      if (shippingCost > 0) {
        lineItems.push({
          id: 'shipping',
          name: 'Shipping',
          description: 'Standard shipping',
          image: '',
          price: Math.round(shippingCost * 100),
          quantity: 1
        });
      }
      
      // Call our Supabase Edge Function to create a Razorpay order
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: Math.round(finalTotal * 100), // Convert to paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            items: JSON.stringify(lineItems.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity
            }))),
            user_id: user?.id || 'guest'
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const { id: orderId, amount } = await response.json();
      
      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: amount,
          currency: 'INR',
          name: 'Yggr Plant Hub',
          description: 'Plant Purchase',
          order_id: orderId,
          handler: async function(response: any) {
            try {
              // Verify payment with our backend
              const verifyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              
              if (!verifyResponse.ok) {
                throw new Error('Payment verification failed');
              }
              
              // Create order in database
              if (user) {
                const { error: orderError } = await supabase
                  .from('orders')
                  .insert([{
                    buyer_id: user.id,
                    total_amount: finalTotal,
                    status: 'confirmed',
                    payment_status: 'paid',
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id
                  }]);
                
                if (orderError) {
                  console.error('Error saving order:', orderError);
                }
              }
              
              // Redirect to success page
              window.location.href = `/checkout/success?order_id=${response.razorpay_order_id}`;
            } catch (error) {
              console.error('Payment verification error:', error);
              setCheckoutError('Payment verification failed. Please contact support.');
              setIsCheckingOut(false);
            }
          },
          prefill: {
            name: user?.user_metadata?.full_name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#00C896',
          },
          modal: {
            ondismiss: function() {
              setIsCheckingOut(false);
            }
          }
        };
        
        // @ts-ignore - Razorpay is loaded via script
        const razorpayCheckout = new window.Razorpay(options);
        razorpayCheckout.open();
      };
      
      script.onerror = () => {
        setCheckoutError('Failed to load payment gateway. Please try again.');
        setIsCheckingOut(false);
        document.body.removeChild(script);
      };
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message || 'An error occurred during checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-xl z-50 animate-slide-up">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary-200">
            <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">
              Shopping Cart ({cartItems.length})
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center">
                <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-secondary-300 mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-secondary-500 text-sm sm:text-base">
                  Add some beautiful plants to get started!
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <div key={item.plantId} className="flex space-x-3 sm:space-x-4 bg-secondary-50 rounded-lg p-3 sm:p-4">
                    <img
                      src={item.plant.images[0]}
                      alt={item.plant.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-secondary-900 text-sm sm:text-base line-clamp-1">
                        {item.plant.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-secondary-500 mb-2">₹{item.plant.price}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onUpdateQuantity(item.plantId, item.quantity - 1)}
                            className="p-1 hover:bg-secondary-200 rounded transition-colors"
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <span className="w-6 sm:w-8 text-center font-medium text-sm">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.plantId, item.quantity + 1)}
                            className="p-1 hover:bg-secondary-200 rounded transition-colors"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.plantId)}
                          className="text-error-500 hover:text-error-600 transition-colors text-xs sm:text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-secondary-200 p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                {total < 50 && (
                  <p className="text-xs text-secondary-500">
                    Add ₹{(50 - total).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="flex justify-between font-semibold text-base sm:text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {checkoutError && (
                <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-700">
                  {checkoutError}
                </div>
              )}
              
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm sm:text-base flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};