import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabase/config';
import { Session, User } from '@supabase/supabase-js';

// Define the shape of our auth context
interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  signOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get the current session and set up a listener for auth changes
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check if user is admin
        if (currentSession?.user) {
          const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', currentSession.user.id)
            .single();
          
          if (data && !error) {
            setIsAdmin(true);
          }
        }

        // Set up auth listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            // Check if user is admin
            if (newSession?.user) {
              const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('user_id', newSession.user.id)
                .single();
              
              if (data && !error) {
                setIsAdmin(true);
              } else {
                setIsAdmin(false);
              }
            } else {
              setIsAdmin(false);
            }
          }
        );

        setLoading(false);
        
        // Cleanup function to remove the listener
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if user is admin
      if (data.user) {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
        
        if (adminData && !adminError) {
          setIsAdmin(true);
          return { success: true, error: null };
        } else {
          // Sign out if not admin
          await supabase.auth.signOut();
          return { success: false, error: 'User is not authorized as admin' };
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
