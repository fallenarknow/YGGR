import { supabase } from './supabase';

// RevenueCat API keys
const REVENUECAT_PUBLIC_SDK_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_SDK_KEY || 'dummy_public_key';
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || 'dummy_api_key';

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: 'free_plan',
  BASIC: 'basic_plan',
  PREMIUM: 'premium_plan',
  ENTERPRISE: 'enterprise_plan'
};

// Plan features
export const PLAN_FEATURES = {
  [SUBSCRIPTION_PLANS.FREE]: {
    name: 'Free',
    price: '₹0/month',
    features: [
      'List up to 10 plants',
      'Basic analytics',
      'Standard support',
      'Single location'
    ],
    limits: {
      plantListings: 10,
      locations: 1,
      analytics: 'basic',
      support: 'standard'
    }
  },
  [SUBSCRIPTION_PLANS.BASIC]: {
    name: 'Basic',
    price: '₹499/month',
    features: [
      'List up to 50 plants',
      'Basic analytics',
      'Priority support',
      'Up to 2 locations'
    ],
    limits: {
      plantListings: 50,
      locations: 2,
      analytics: 'basic',
      support: 'priority'
    }
  },
  [SUBSCRIPTION_PLANS.PREMIUM]: {
    name: 'Premium',
    price: '₹999/month',
    features: [
      'List up to 200 plants',
      'Advanced analytics',
      'Priority support',
      'Up to 5 locations',
      'Featured listings'
    ],
    limits: {
      plantListings: 200,
      locations: 5,
      analytics: 'advanced',
      support: 'priority',
      featured: true
    }
  },
  [SUBSCRIPTION_PLANS.ENTERPRISE]: {
    name: 'Enterprise',
    price: '₹2499/month',
    features: [
      'Unlimited plant listings',
      'Advanced analytics with insights',
      'Dedicated support',
      'Unlimited locations',
      'Featured listings',
      'Custom branding'
    ],
    limits: {
      plantListings: Infinity,
      locations: Infinity,
      analytics: 'premium',
      support: 'dedicated',
      featured: true,
      customBranding: true
    }
  }
};

// RevenueCat API client
class RevenueCatClient {
  private static instance: RevenueCatClient;
  private userId: string | null = null;
  private currentSubscription: any = null;

  private constructor() {}

  public static getInstance(): RevenueCatClient {
    if (!RevenueCatClient.instance) {
      RevenueCatClient.instance = new RevenueCatClient();
    }
    return RevenueCatClient.instance;
  }

  // Initialize with user ID
  public async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.fetchSubscriptionStatus();
  }

  // Get current subscription plan
  public async getCurrentPlan(): Promise<string> {
    if (!this.currentSubscription) {
      await this.fetchSubscriptionStatus();
    }
    
    return this.currentSubscription?.plan || SUBSCRIPTION_PLANS.FREE;
  }

  // Check if user has access to a specific feature
  public async hasAccess(feature: string, quantity: number = 1): Promise<boolean> {
    const currentPlan = await this.getCurrentPlan();
    const planFeatures = PLAN_FEATURES[currentPlan]?.limits || PLAN_FEATURES[SUBSCRIPTION_PLANS.FREE].limits;
    
    switch (feature) {
      case 'plantListings':
        return quantity <= planFeatures.plantListings;
      case 'locations':
        return quantity <= planFeatures.locations;
      case 'analytics':
        return ['basic', 'advanced', 'premium'].indexOf(planFeatures.analytics) >= 
               ['basic', 'advanced', 'premium'].indexOf(feature);
      case 'featured':
        return !!planFeatures.featured;
      case 'customBranding':
        return !!planFeatures.customBranding;
      default:
        return false;
    }
  }

  // Fetch subscription status from RevenueCat API
  private async fetchSubscriptionStatus(): Promise<void> {
    if (!this.userId) {
      this.currentSubscription = { plan: SUBSCRIPTION_PLANS.FREE };
      return;
    }

    try {
      // In a real implementation, this would call the RevenueCat API
      // For now, we'll fetch from our Supabase database
      const { data, error } = await supabase
        .from('seller_subscriptions')
        .select('*')
        .eq('seller_id', this.userId)
        .single();

      if (error || !data) {
        this.currentSubscription = { plan: SUBSCRIPTION_PLANS.FREE };
        return;
      }

      this.currentSubscription = {
        plan: data.plan,
        expiresAt: data.expires_at,
        status: data.status
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      this.currentSubscription = { plan: SUBSCRIPTION_PLANS.FREE };
    }
  }

  // Subscribe to a plan
  public async subscribeToPlan(planId: string): Promise<boolean> {
    if (!this.userId) return false;

    try {
      // In a real implementation, this would call the RevenueCat API
      // For now, we'll update our Supabase database
      const { error } = await supabase
        .from('seller_subscriptions')
        .upsert({
          seller_id: this.userId,
          plan: planId,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });

      if (error) {
        console.error('Error subscribing to plan:', error);
        return false;
      }

      // Refresh subscription status
      await this.fetchSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      return false;
    }
  }

  // Cancel subscription
  public async cancelSubscription(): Promise<boolean> {
    if (!this.userId) return false;

    try {
      // In a real implementation, this would call the RevenueCat API
      // For now, we'll update our Supabase database
      const { error } = await supabase
        .from('seller_subscriptions')
        .update({
          status: 'cancelled',
          expires_at: new Date().toISOString() // Expire immediately
        })
        .eq('seller_id', this.userId);

      if (error) {
        console.error('Error cancelling subscription:', error);
        return false;
      }

      // Refresh subscription status
      await this.fetchSubscriptionStatus();
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }
}

export const revenueCat = RevenueCatClient.getInstance();