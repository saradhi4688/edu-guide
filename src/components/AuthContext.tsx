import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Create Supabase client
function createSupabaseClient() {
  return {
    auth: {
      async signInWithPassword(credentials: { email: string; password: string }) {
        const response = await fetch(`https://${projectId}.supabase.co/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': publicAnonKey,
          },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error_description || 'Login failed');
        }

        const data = await response.json();
        return {
          data: {
            session: {
              access_token: data.access_token,
              user: data.user
            }
          },
          error: null
        };
      },

      async signOut() {
        const token = localStorage.getItem('access_token');
        if (!token) return { error: null };

        try {
          await fetch(`https://${projectId}.supabase.co/auth/v1/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'apikey': publicAnonKey,
            },
          });
        } catch (error) {
          console.error('Logout error:', error);
        }

        return { error: null };
      },

      async getSession() {
        const token = localStorage.getItem('access_token');
        if (!token) return { data: { session: null }, error: null };

        // Skip Supabase calls for demo/temp tokens
        if (token === 'demo_token_123' || token?.startsWith('temp_token_') || token?.startsWith('token_')) {
          return { data: { session: null }, error: null };
        }

        try {
          const response = await fetch(`https://${projectId}.supabase.co/auth/v1/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'apikey': publicAnonKey,
            },
          });

          if (!response.ok) {
            // Only remove tokens if it's not a demo/temp token
            if (!token.startsWith('demo_') && !token.startsWith('temp_') && !token.startsWith('token_')) {
              localStorage.removeItem('access_token');
              localStorage.removeItem('user_data');
            }
            return { data: { session: null }, error: null };
          }

          const userData = await response.json();
          return {
            data: {
              session: {
                access_token: token,
                user: userData
              }
            },
            error: null
          };
        } catch (error) {
          // Only remove tokens if it's not a demo/temp token
          if (!token.startsWith('demo_') && !token.startsWith('temp_') && !token.startsWith('token_')) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
          }
          return { data: { session: null }, error: null };
        }
      }
    }
  };
}

const supabase = createSupabaseClient();

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
      // Special handling for demo account
      if (email === 'demo@eduguide.in' && password === 'demo123') {
        const demoUser: User = {
          uid: 'demo_user_123',
          email: email,
          displayName: 'Demo Student',
          role: 'student',
          profileCompleted: true,
          locale: 'en'
        };
      // Demo admin account
      if (email === 'admin@eduguide.in' && password === 'admin123') {
        const adminUser: User = {
          uid: 'demo_admin_001',
          email: email,
          displayName: 'Admin',
          role: 'admin',
          profileCompleted: true,
          locale: 'en'
        };
        setUser(adminUser);
        localStorage.setItem('access_token', 'demo_token_admin');
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_data', JSON.stringify(adminUser));
        return;
      }
        
        setUser(demoUser);
        localStorage.setItem('access_token', 'demo_token_123');
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_data', JSON.stringify(demoUser));
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Password validation
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // For development: Simple password validation
      // In production, this would validate against Supabase
      if (password === 'password' || password === '123456' || password === 'admin') {
        throw new Error('Password too weak. Please use a stronger password');
      }

      // Create user session for valid credentials
      const tempUser: User = {
        uid: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: email.split('@')[0],
        role: 'student',
        profileCompleted: false,
        locale: 'en'
      };
      
      const tempToken = 'token_' + tempUser.uid;
      setUser(tempUser);
      localStorage.setItem('access_token', tempToken);
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_data', JSON.stringify(tempUser));

      // Original Supabase authentication (commented out for demo)
      /*
      try {
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw new Error(error.message);
        }

        if (session) {
          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('user_email', email);
          
          // Fetch or create user profile
          await fetchUserProfile(session.access_token);
        }
      } catch (authError) {
        // If Supabase auth fails, create a temporary session for development
        console.warn('Supabase auth failed, creating temporary session:', authError);
        const tempToken = 'temp_token_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('access_token', tempToken);
        localStorage.setItem('user_email', email);
        await fetchUserProfile(tempToken);
      }
      */
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // For development/demo purposes, allow any email/password combination
      // In production, this would use proper Supabase authentication
      if (email && password && displayName) {
        const tempUser: User = {
          uid: 'temp_user_' + Math.random().toString(36).substr(2, 9),
          email: email,
          displayName,
          role: 'student',
          profileCompleted: false,
          locale: 'en'
        };
        
        const tempToken = 'temp_token_' + tempUser.uid;
        setUser(tempUser);
        localStorage.setItem('access_token', tempToken);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_data', JSON.stringify(tempUser));
        return;
      }

      // Original Supabase signup (commented out for demo)
      /*
      try {
        // Use server signup endpoint for proper user creation
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f040132c/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email,
            password,
            displayName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Signup failed');
        }

        const { user: newUser, access_token } = await response.json();
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_email', email);
        
        const userData: User = {
          uid: newUser.id,
          email: newUser.email,
          displayName,
          role: 'student',
          profileCompleted: false,
          locale: 'en'
        };
        
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
      } catch (signupError) {
        // If server signup fails, create a temporary account for development
        console.warn('Server signup failed, creating temporary account:', signupError);
        const tempUser: User = {
          uid: 'temp_user_' + Math.random().toString(36).substr(2, 9),
          email: email,
          displayName,
          role: 'student',
          profileCompleted: false,
          locale: 'en'
        };
        
        const tempToken = 'temp_token_' + tempUser.uid;
        localStorage.setItem('access_token', tempToken);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_data', JSON.stringify(tempUser));
        setUser(tempUser);
      }
      */
    } catch (error) {
      throw error;
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