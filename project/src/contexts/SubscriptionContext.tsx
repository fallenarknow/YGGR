import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { revenueCat, SUBSCRIPTION_PLANS, PLAN_FEATURES } from '../lib/revenuecat';

interface SubscriptionContextType {
  currentPlan: string;
  planFeatures: any;
  isLoading: boolean;
  hasAccess: (feature: string, quantity?: number) => Promise<boolean>;
  subscribeToPlan: (planId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string>(SUBSCRIPTION_PLANS.FREE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize RevenueCat with user ID when user changes
  useEffect(() => {
    const initializeRevenueCat = async () => {
      if (user && profile?.role === 'seller') {
        setIsLoading(true);
        try {
          await revenueCat.initialize(user.id);
          const plan = await revenueCat.getCurrentPlan();
          setCurrentPlan(plan);
        } catch (error) {
          console.error('Error initializing RevenueCat:', error);
          setCurrentPlan(SUBSCRIPTION_PLANS.FREE);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentPlan(SUBSCRIPTION_PLANS.FREE);
        setIsLoading(false);
      }
    };

    initializeRevenueCat();
  }, [user, profile]);

  // Check if user has access to a specific feature
  const hasAccess = async (feature: string, quantity: number = 1): Promise<boolean> => {
    if (!user || profile?.role !== 'seller') return false;
    return revenueCat.hasAccess(feature, quantity);
  };

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string): Promise<boolean> => {
    if (!user || profile?.role !== 'seller') return false;
    const success = await revenueCat.subscribeToPlan(planId);
    if (success) {
      setCurrentPlan(planId);
    }
    return success;
  };

  // Cancel subscription
  const cancelSubscription = async (): Promise<boolean> => {
    if (!user || profile?.role !== 'seller') return false;
    const success = await revenueCat.cancelSubscription();
    if (success) {
      setCurrentPlan(SUBSCRIPTION_PLANS.FREE);
    }
    return success;
  };

  // Refresh subscription status
  const refreshSubscription = async (): Promise<void> => {
    if (!user || profile?.role !== 'seller') return;
    setIsLoading(true);
    try {
      await revenueCat.initialize(user.id);
      const plan = await revenueCat.getCurrentPlan();
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    currentPlan,
    planFeatures: PLAN_FEATURES[currentPlan] || PLAN_FEATURES[SUBSCRIPTION_PLANS.FREE],
    isLoading,
    hasAccess,
    subscribeToPlan,
    cancelSubscription,
    refreshSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};