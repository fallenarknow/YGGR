import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

export const CheckoutCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-error-500 mb-6">
          <XCircle className="h-16 w-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-3">Checkout Cancelled</h2>
        <p className="text-secondary-600 mb-8">
          Your order has been cancelled and no payment has been processed.
          Your items are still in your cart if you'd like to complete your purchase.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 bg-secondary-100 text-secondary-700 px-6 py-3 rounded-xl font-medium hover:bg-secondary-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
            onClick={() => document.querySelector('[data-cart-toggle]')?.dispatchEvent(new Event('click'))}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>View Cart</span>
          </Link>
        </div>
      </div>
    </div>
  );
};