import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
}

export async function createUserProfile(userId: string, email: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          email: email,
          display_name: email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
