import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Package, Truck, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('No order ID found');
        setLoading(false);
        return;
      }

      try {
        // Query the orders table for the order with this Razorpay order ID
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('razorpay_order_id', orderId)
          .single();

        if (error) {
          throw error;
        }

        setOrderDetails(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please contact customer support.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-primary-700 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="text-error-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Something went wrong</h2>
          <p className="text-secondary-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Estimated delivery date (5 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
            <p className="text-green-100">Thank you for your purchase</p>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-secondary-900">Order Summary</h2>
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                Paid
              </span>
            </div>

            <div className="space-y-6">
              {/* Order ID */}
              <div className="bg-secondary-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-secondary-600">Order ID</p>
                    <p className="font-medium">{orderDetails?.razorpay_order_id || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-secondary-600">Date</p>
                    <p className="font-medium">
                      {orderDetails?.order_date 
                        ? new Date(orderDetails.order_date).toLocaleDateString() 
                        : new Date().toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="border border-secondary-200 rounded-xl p-6">
                <h3 className="font-semibold text-secondary-900 mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-primary-600" />
                  Delivery Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium">Package in Preparation</p>
                      <p className="text-sm text-secondary-600">Your order is being prepared for shipping</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-sm text-secondary-600">{formattedDeliveryDate}</p>
                    </div>
                  </div>
                  
                  {orderDetails?.shipping_address && (
                    <div className="pt-4 border-t border-secondary-200">
                      <p className="font-medium mb-2">Shipping Address</p>
                      <p className="text-sm text-secondary-600">
                        {orderDetails.shipping_address.line1}
                        {orderDetails.shipping_address.line2 && `, ${orderDetails.shipping_address.line2}`}
                        <br />
                        {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.postal_code}
                        <br />
                        {orderDetails.shipping_address.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="border border-secondary-200 rounded-xl p-6">
                <h3 className="font-semibold text-secondary-900 mb-4">Payment Information</h3>
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-bold">₹{orderDetails?.total_amount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm text-secondary-600 mt-2">
                  <span>Payment Method</span>
                  <span>Razorpay</span>
                </div>
                <div className="flex justify-between text-sm text-secondary-600 mt-2">
                  <span>Payment ID</span>
                  <span className="font-mono">{orderDetails?.razorpay_payment_id || 'N/A'}</span>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
                <h3 className="font-semibold text-primary-800 mb-3">What's Next?</h3>
                <ul className="space-y-2 text-primary-700">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>You'll receive an order confirmation email shortly</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>We'll notify you when your order ships</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>Prepare a spot for your new plant friends!</span>
                  </li>
                </ul>
              </div>

              {/* Continue Shopping Button */}
              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};