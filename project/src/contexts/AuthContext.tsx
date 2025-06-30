import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthState, UserProfile, getCurrentUser, resendVerificationEmail } from '../lib/auth';

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmed, setEmailConfirmed] = useState<boolean | null>(null);

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && profileData) {
        setProfile(profileData);
      } else {
        console.error('Error refreshing profile:', error);
        // Don't attempt to create a profile here - rely on the database trigger
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    await resendVerificationEmail(email);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setEmailConfirmed(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const authState = await getCurrentUser();
        setUser(authState.user);
        setProfile(authState.profile);
        setEmailConfirmed(authState.emailConfirmed);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const previousUser = user;
        const currentUser = session?.user ?? null;
        
        setUser(currentUser);
        setEmailConfirmed(currentUser?.email_confirmed_at ? true : false);

        if (currentUser) {
          try {
            // Check if profile exists
            const { data: existingProfile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();

            if (error) {
              console.error('Error fetching profile:', error);
              // Don't attempt to create a profile here - rely on the database trigger
            } else {
              setProfile(existingProfile);
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    emailConfirmed,
    signOut,
    refreshProfile,
    resendConfirmationEmail,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};