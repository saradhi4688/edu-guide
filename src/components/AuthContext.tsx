import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'counselor' | 'admin';
  profileCompleted: boolean;
  locale: 'en' | 'hi';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  getAuthToken: () => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Initialize Supabase client (anon key only on client)
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL) ? process.env.NEXT_PUBLIC_SUPABASE_URL : `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : publicAnonKey;

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true }
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const savedUserData = localStorage.getItem('user_data');
        if (savedUserData) {
          setUser(JSON.parse(savedUserData));
        } else {
          // Fetch user profile from server
          await fetchUserProfile(session.access_token);
        }
      } else {
        // Check for existing temporary session
        const savedUserData = localStorage.getItem('user_data');
        const accessToken = localStorage.getItem('access_token');
        if (savedUserData && accessToken) {
          setUser(JSON.parse(savedUserData));
        }
      }
    } catch (error) {
      // Only log non-auth related errors to avoid console spam
      const isAuthError = error instanceof Error && (
        error.message.includes('403') ||
        error.message.includes('Forbidden') ||
        error.message.includes('Invalid JWT') ||
        error.message.includes('401') ||
        error.message.includes('Unauthorized')
      );
      
      if (!isAuthError) {
        console.warn('Session check failed - using demo mode:', error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Check for existing temporary session even if Supabase fails
      const savedUserData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('access_token');
      if (savedUserData && accessToken) {
        setUser(JSON.parse(savedUserData));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (accessToken: string) => {
    try {
      // Skip server calls for demo/temp tokens
      if (accessToken === 'demo_token_123' || accessToken?.startsWith('temp_token_') || accessToken?.startsWith('token_')) {
        // Create a fallback user profile for demo mode
        const email = localStorage.getItem('user_email') || 'user@example.com';
        const fallbackUser: User = {
          uid: 'temp_user_' + Math.random().toString(36).substr(2, 9),
          email: email,
          displayName: email.split('@')[0],
          role: 'student',
          profileCompleted: false,
          locale: 'en'
        };
        setUser(fallbackUser);
        localStorage.setItem('user_data', JSON.stringify(fallbackUser));
        return;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f040132c/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        localStorage.setItem('user_data', JSON.stringify(userData.user));
      } else {
        // Create a fallback user profile if server is not available
        const email = localStorage.getItem('user_email') || 'user@example.com';
        const fallbackUser: User = {
          uid: 'temp_user_' + Math.random().toString(36).substr(2, 9),
          email: email,
          displayName: email.split('@')[0],
          role: 'student',
          profileCompleted: false,
          locale: 'en'
        };
        setUser(fallbackUser);
        localStorage.setItem('user_data', JSON.stringify(fallbackUser));
      }
    } catch (error) {
      // Silently handle auth errors in demo mode
      const isAuthError = error instanceof Error && (
        error.message.includes('Invalid JWT') || 
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('Unauthorized')
      );
      
      if (!isAuthError) {
        console.warn('Failed to fetch user profile:', error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Create a fallback user profile
      const email = localStorage.getItem('user_email') || 'user@example.com';
      const fallbackUser: User = {
        uid: 'temp_user_' + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: email.split('@')[0],
        role: 'student',
        profileCompleted: false,
        locale: 'en'
      };
      setUser(fallbackUser);
      localStorage.setItem('user_data', JSON.stringify(fallbackUser));
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const allowDemo = process.env.NEXT_PUBLIC_ALLOW_DEMO_ACCOUNTS === 'true';
      // Demo bypass
      if (allowDemo && ((email === 'demo@eduguide.in' && password === 'demo123') || (email === 'admin@eduguide.in' && password === 'admin123'))) {
        const isAdmin = email === 'admin@eduguide.in';
        const demoUser: User = {
          uid: isAdmin ? 'demo_admin_001' : 'demo_user_123',
          email,
          displayName: isAdmin ? 'Admin' : 'Demo Student',
          role: isAdmin ? 'admin' : 'student',
          profileCompleted: true,
          locale: 'en'
        };
        setUser(demoUser);
        try { localStorage.setItem('user_data', JSON.stringify(demoUser)); } catch {}
        localStorage.setItem('access_token', isAdmin ? 'demo_token_admin' : 'demo_token_123');
        return;
      }

      // Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Please enter a valid email address');
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long');

      // Call Supabase SDK
      const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message || 'Failed to sign in');

      if (session?.user) {
        // Map Supabase user to our User shape
        const su = session.user as any;
        const mapped: User = {
          uid: su.id,
          email: su.email || email,
          displayName: (su.user_metadata && (su.user_metadata.displayName || su.user_metadata.full_name)) || su.email?.split('@')[0] || '',
          role: 'student',
          profileCompleted: false,
          locale: 'en'
        };
        setUser(mapped);
        try { localStorage.setItem('user_data', JSON.stringify(mapped)); } catch {}
      }

      return session;
    } catch (err:any) {
      // rethrow to UI
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Please enter a valid email address');
      if (!password || password.length < 6) throw new Error('Password must be at least 6 characters long');
      if (!displayName || displayName.trim().length < 2) throw new Error('Please provide a display name');

      // Create user
      // Note: supabase signUp signature may vary; use options for metadata
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { displayName } } } as any);
      if (error) throw new Error(error.message || 'Signup failed');

      // If a user object is returned and account is confirmed, sign in to obtain session
      if (data?.user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw new Error(signInError.message || 'Failed to sign in after signup');
        const session = signInData.session;
        if (session?.user) {
          const su = session.user as any;
          const mapped: User = {
            uid: su.id,
            email: su.email || email,
            displayName: (su.user_metadata && (su.user_metadata.displayName || su.user_metadata.full_name)) || su.email?.split('@')[0] || displayName,
            role: 'student',
            profileCompleted: false,
            locale: 'en'
          };
          setUser(mapped);
          try { localStorage.setItem('user_data', JSON.stringify(mapped)); } catch {}
        }
        return signInData.session;
      }

      // Otherwise inform about confirmation email
      return { message: 'Signup successful. Please confirm your email before logging in.' } as any;
    } catch (err:any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));

    // Sync with server (skip for demo/temp tokens)
    try {
      const token = localStorage.getItem('access_token');
      if (token && !token.startsWith('demo_') && !token.startsWith('temp_') && !token.startsWith('token_')) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f040132c/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }
    } catch (error) {
      // Silently handle sync errors in demo mode
      const isAuthError = error instanceof Error && (
        error.message.includes('Invalid JWT') || 
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('Unauthorized')
      );
      
      if (!isAuthError) {
        console.warn('Failed to sync profile with server:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  };

  const getAuthToken = (): string => {
    return localStorage.getItem('access_token') || '';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, getAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}
