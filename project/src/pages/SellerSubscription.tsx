import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  X, 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  Loader2, 
  CheckCircle,
  Crown,
  Zap,
  Rocket,
  Building
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS, PLAN_FEATURES } from '../lib/revenuecat';
import { useAuth } from '../contexts/AuthContext';

export const SellerSubscription: React.FC = () => {
  const { currentPlan, planFeatures, isLoading, subscribeToPlan, cancelSubscription } = useSubscription();
  const { user, profile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);

  useEffect(() => {
    // Set the current plan as selected by default
    if (currentPlan && !selectedPlan) {
      setSelectedPlan(currentPlan);
    }
  }, [currentPlan]);

  const handleSubscribe = async () => {
    if (!selectedPlan || selectedPlan === currentPlan) return;
    
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      const success = await subscribeToPlan(selectedPlan);
      if (success) {
        setSubscriptionSuccess(true);
        setTimeout(() => setSubscriptionSuccess(false), 3000);
      } else {
        throw new Error('Failed to process subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setProcessingError(error.message || 'An error occurred while processing your subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      const success = await cancelSubscription();
      if (success) {
        setShowCancelConfirm(false);
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      setProcessingError(error.message || 'An error occurred while cancelling your subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case SUBSCRIPTION_PLANS.FREE:
        return <Building className="h-6 w-6" />;
      case SUBSCRIPTION_PLANS.BASIC:
        return <Zap className="h-6 w-6" />;
      case SUBSCRIPTION_PLANS.PREMIUM:
        return <Crown className="h-6 w-6" />;
      case SUBSCRIPTION_PLANS.ENTERPRISE:
        return <Rocket className="h-6 w-6" />;
      default:
        return <Building className="h-6 w-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-primary-700 font-medium">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
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
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-secondary-900">Subscription Plans</h1>
              <p className="text-secondary-600 text-lg">Upgrade your seller account to unlock more features</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {subscriptionSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3 animate-fade-in">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="text-green-800 font-medium">Your subscription has been updated successfully!</span>
          </div>
        )}

        {/* Error Message */}
        {processingError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3 animate-fade-in">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <span className="text-red-800 font-medium">{processingError}</span>
          </div>
        )}

        {/* Current Plan */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
              {getPlanIcon(currentPlan)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">Current Plan: {planFeatures.name}</h2>
              <p className="text-secondary-600">
                {currentPlan === SUBSCRIPTION_PLANS.FREE 
                  ? 'Free plan with limited features' 
                  : `${planFeatures.price} subscription`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-secondary-50 p-4 rounded-xl">
              <h3 className="font-medium text-secondary-900 mb-2">Plant Listings</h3>
              <p className="text-2xl font-bold text-primary-600">
                {planFeatures.limits.plantListings === Infinity ? 'Unlimited' : planFeatures.limits.plantListings}
              </p>
            </div>
            
            <div className="bg-secondary-50 p-4 rounded-xl">
              <h3 className="font-medium text-secondary-900 mb-2">Locations</h3>
              <p className="text-2xl font-bold text-primary-600">
                {planFeatures.limits.locations === Infinity ? 'Unlimited' : planFeatures.limits.locations}
              </p>
            </div>
            
            <div className="bg-secondary-50 p-4 rounded-xl">
              <h3 className="font-medium text-secondary-900 mb-2">Analytics</h3>
              <p className="text-2xl font-bold text-primary-600 capitalize">
                {planFeatures.limits.analytics}
              </p>
            </div>
            
            <div className="bg-secondary-50 p-4 rounded-xl">
              <h3 className="font-medium text-secondary-900 mb-2">Support</h3>
              <p className="text-2xl font-bold text-primary-600 capitalize">
                {planFeatures.limits.support}
              </p>
            </div>
          </div>

          {currentPlan !== SUBSCRIPTION_PLANS.FREE && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Cancel Subscription
              </button>
            </div>
          )}
        </div>

        {/* Plan Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Available Plans</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, planId]) => {
              const plan = PLAN_FEATURES[planId];
              const isCurrentPlan = currentPlan === planId;
              const isSelected = selectedPlan === planId;
              
              return (
                <div 
                  key={planId}
                  className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    isSelected 
                      ? 'border-primary-500 shadow-xl transform scale-105' 
                      : 'border-secondary-200 hover:border-primary-300'
                  }`}
                >
                  <div className={`p-6 ${isCurrentPlan ? 'bg-primary-50' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-600'
                        }`}>
                          {getPlanIcon(planId)}
                        </div>
                        <h3 className="font-bold text-secondary-900 text-lg">{plan.name}</h3>
                      </div>
                      {isCurrentPlan && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-secondary-900">{plan.price}</div>
                      {planId !== SUBSCRIPTION_PLANS.FREE && (
                        <div className="text-sm text-secondary-500">Billed monthly</div>
                      )}
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-secondary-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => setSelectedPlan(planId)}
                      disabled={isCurrentPlan || isProcessing}
                      className={`w-full py-2 rounded-xl font-medium transition-colors ${
                        isCurrentPlan
                          ? 'bg-secondary-100 text-secondary-500 cursor-not-allowed'
                          : isSelected
                            ? 'bg-primary-600 text-white'
                            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                      }`}
                    >
                      {isCurrentPlan ? 'Current Plan' : isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription Action */}
        {selectedPlan && selectedPlan !== currentPlan && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">
              {currentPlan === SUBSCRIPTION_PLANS.FREE 
                ? 'Subscribe to ' 
                : 'Change to '}
              {PLAN_FEATURES[selectedPlan].name} Plan
            </h2>
            
            <div className="bg-secondary-50 p-6 rounded-xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-secondary-900">Subscription Summary</h3>
                  <p className="text-secondary-600 text-sm">
                    {selectedPlan === SUBSCRIPTION_PLANS.FREE 
                      ? 'Downgrade to Free Plan' 
                      : `${PLAN_FEATURES[selectedPlan].price} billed monthly`}
                  </p>
                </div>
                <div className="text-2xl font-bold text-secondary-900">
                  {PLAN_FEATURES[selectedPlan].price.split('/')[0]}
                </div>
              </div>
              
              <div className="border-t border-secondary-200 pt-4">
                <h4 className="font-medium text-secondary-900 mb-2">What's included:</h4>
                <ul className="space-y-2">
                  {PLAN_FEATURES[selectedPlan].features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-secondary-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-5 w-5 text-primary-600" />
              <span className="text-sm text-secondary-700">
                Secure payment processing. Cancel anytime.
              </span>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedPlan(currentPlan)}
                disabled={isProcessing}
                className="px-6 py-3 border border-secondary-300 text-secondary-700 rounded-xl hover:bg-secondary-50 transition-colors flex-1"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex-1 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>
                      {selectedPlan === SUBSCRIPTION_PLANS.FREE 
                        ? 'Downgrade to Free' 
                        : currentPlan === SUBSCRIPTION_PLANS.FREE 
                          ? 'Subscribe Now' 
                          : 'Change Plan'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl">
              <h3 className="font-semibold text-secondary-900 mb-2">How do subscriptions work?</h3>
              <p className="text-secondary-700">
                Subscriptions are billed monthly and provide access to premium features based on your chosen plan. You can upgrade, downgrade, or cancel at any time.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl">
              <h3 className="font-semibold text-secondary-900 mb-2">Can I change plans later?</h3>
              <p className="text-secondary-700">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and your billing will be adjusted accordingly.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl">
              <h3 className="font-semibold text-secondary-900 mb-2">What happens if I exceed my plan limits?</h3>
              <p className="text-secondary-700">
                You'll be notified when you're approaching your plan limits. To add more listings or locations, you'll need to upgrade to a higher tier plan.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl">
              <h3 className="font-semibold text-secondary-900 mb-2">How do I cancel my subscription?</h3>
              <p className="text-secondary-700">
                You can cancel your subscription at any time from this page. Your premium features will remain active until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">Cancel Subscription?</h2>
              <p className="text-secondary-600">
                Are you sure you want to cancel your {PLAN_FEATURES[currentPlan].name} subscription? You'll lose access to premium features at the end of your current billing period.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 px-4 py-3 border border-secondary-300 text-secondary-700 rounded-xl hover:bg-secondary-50 transition-colors"
              >
                Keep Subscription
              </button>
              
              <button
                onClick={handleCancelSubscription}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5" />
                    <span>Yes, Cancel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};