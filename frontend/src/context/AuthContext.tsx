import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            is_guest: false,
          });
          setIsGuest(false);
        } else {
          setGuestUser();
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            is_guest: false,
          });
          setIsGuest(false);
        } else {
          setGuestUser();
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setGuestUser();
      setLoading(false);
    }
  }, []);

  const setGuestUser = () => {
    setIsGuest(true);
    setUser({
      id: 'guest-nova-user',
      email: 'guest@nova.ai',
      full_name: 'NOVA Explorer',
      is_guest: true,
    });
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setUser({
        id: 'demo-user-id',
        email,
        full_name: email.split('@')[0],
        is_guest: false,
      });
      setIsGuest(false);
      setIsAuthModalOpen(false);
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          is_guest: false,
        });
        setIsGuest(false);
        setIsAuthModalOpen(false);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      setUser({
        id: 'demo-user-id',
        email,
        full_name: fullName || email.split('@')[0],
        is_guest: false,
      });
      setIsGuest(false);
      setIsAuthModalOpen(false);
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          is_guest: false,
        });
        setIsGuest(false);
        setIsAuthModalOpen(false);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to register' };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setGuestUser();
  };

  const continueAsGuest = () => {
    setGuestUser();
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        signIn,
        signUp,
        signOut,
        continueAsGuest,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
