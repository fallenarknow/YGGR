import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'buyer' | 'seller';
  business_name?: string;
  business_verified: boolean;
  created_at: string;
  avatar_url?: string;
  living_situation?: string;
  plant_preferences?: string;
  available_space?: string;
  business_type?: string;
  business_address?: string;
  business_description?: string;
  business_phone?: string;
  email_confirmed_at?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  emailConfirmed: boolean | null;
}

export const signUp = async (email: string, password: string, userData: {
  full_name: string;
  role: 'buyer' | 'seller';
  business_name?: string;
}) => {
  try {
    // Check if user already exists before attempting to sign up
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (existingUser) {
      throw new Error('An account with this email already exists. Please try logging in instead.');
    }
    
    // Sign up the user with Supabase Auth with minimal data
    // The profile will be created by the database trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role,
          business_name: userData.business_name
        }
      }
    });

    if (error) {
      // Check if the error is related to duplicate user
      if (error.message?.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      }
      throw error;
    }
    
    // The profile will be created automatically by the database trigger
    return data;
  } catch (error: any) {
    // Check if the error is related to duplicate user
    if (error.message?.includes('User already registered') || 
        error.message?.includes('already exists')) {
      throw new Error('An account with this email already exists. Please try logging in instead.');
    }
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
  return data;
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
  return data;
};

export const resendVerificationEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email
  });
  
  if (error) throw error;
  return data;
};

export const getCurrentUser = async (): Promise<AuthState> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { user: null, profile: null, loading: false, emailConfirmed: null };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { 
        user, 
        profile: null, 
        loading: false, 
        emailConfirmed: user.email_confirmed_at ? true : false 
      };
    }

    return { 
      user, 
      profile, 
      loading: false, 
      emailConfirmed: user.email_confirmed_at ? true : false 
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { user: null, profile: null, loading: false, emailConfirmed: null };
  }
};

export const updateProfile = async (updates: Partial<UserProfile>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('No authenticated user');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};