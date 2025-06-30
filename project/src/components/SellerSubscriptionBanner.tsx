import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight, AlertTriangle } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS } from '../lib/revenuecat';

interface SellerSubscriptionBannerProps {
  feature?: string;
  quantity?: number;
  className?: string;
}

export const SellerSubscriptionBanner: React.FC<SellerSubscriptionBannerProps> = ({ 
  feature,
  quantity = 1,
  className = ''
}) => {
  const { currentPlan, planFeatures, hasAccess } = useSubscription();
  const [hasFeatureAccess, setHasFeatureAccess] = React.useState(true);
  
  React.useEffect(() => {
    const checkAccess = async () => {
      if (feature) {
        const access = await hasAccess(feature, quantity);
        setHasFeatureAccess(access);
      }
    };
    
    checkAccess();
  }, [feature, quantity, hasAccess]);

  // If no specific feature is being checked or user has access, don't show the banner
  if (!feature || hasFeatureAccess) {
    return null;
  }

  const getFeatureLabel = () => {
    switch (feature) {
      case 'plantListings':
        return `list more than ${planFeatures.limits.plantListings} plants`;
      case 'locations':
        return `add more than ${planFeatures.limits.locations} locations`;
      case 'analytics':
        return 'access advanced analytics';
      case 'featured':
        return 'create featured listings';
      case 'customBranding':
        return 'use custom branding';
      default:
        return 'access this feature';
    }
  };

  return (
    <div className={`bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="bg-primary-500 rounded-lg p-2 text-white">
          <Crown className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-primary-800 mb-1">Upgrade Your Subscription</h3>
          <p className="text-sm text-primary-700 mb-3">
            You need a higher subscription tier to {getFeatureLabel()}.
          </p>
          <Link
            to="/seller/subscription"
            className="inline-flex items-center space-x-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <span>View Plans</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export const SellerFeatureLimitWarning: React.FC<{
  feature: string;
  current: number;
  limit: number;
  className?: string;
}> = ({ feature, current, limit, className = '' }) => {
  // Only show warning when approaching the limit (80% or more)
  const percentUsed = (current / limit) * 100;
  if (percentUsed < 80 || limit === Infinity) {
    return null;
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="bg-yellow-500 rounded-lg p-2 text-white">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800 mb-1">Approaching Limit</h3>
          <p className="text-sm text-yellow-700 mb-2">
            You're using {current} of {limit} {feature.toLowerCase()}.
          </p>
          <div className="w-full bg-yellow-200 rounded-full h-2 mb-3">
            <div 
              className="bg-yellow-500 h-2 rounded-full" 
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            ></div>
          </div>
          <Link
            to="/seller/subscription"
            className="inline-flex items-center space-x-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
          >
            <span>Upgrade Plan</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};