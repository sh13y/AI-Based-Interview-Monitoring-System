import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dummyUser } from '../lib/dummyData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch public user profile
        const { data: dbUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        setUser(dbUser ? { ...session.user, ...dbUser } : session.user);
        setIsAuthenticated(true);
      }
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser(dbUser ? { ...session.user, ...dbUser } : session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      });
    } else {
      // Dummy mode — check localStorage
      const storedAuth = localStorage.getItem('mm_authenticated');
      if (storedAuth === 'true') {
        const storedUser = localStorage.getItem('mm_user_current');
        setUser(storedUser ? JSON.parse(storedUser) : dummyUser);
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  };

  const login = async (credentials) => {
    if (isSupabaseConfigured()) {
      let emailToUse = credentials.userId;

      // If input is User ID (no '@'), look up email in public.users table
      if (!emailToUse.includes('@')) {
        const { data: userData, error: userErr } = await supabase
          .from('users')
          .select('email')
          .eq('user_id_field', credentials.userId)
          .maybeSingle();

        if (userData && userData.email) {
          emailToUse = userData.email;
        } else {
          return {
            success: false,
            error: `User ID "${credentials.userId}" not found. Please check your User ID or sign up.`
          };
        }
      }

      // Authenticate with email & password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: credentials.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Fetch profile from public.users table
      let fullProfile = data.user;
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (dbUser) {
        fullProfile = { ...data.user, ...dbUser };
      }

      setUser(fullProfile);
      setIsAuthenticated(true);
      return { success: true, data: fullProfile };
    } else {
      // Dummy mode login
      localStorage.setItem('mm_authenticated', 'true');
      const savedUser = localStorage.getItem(`mm_user_${credentials.userId}`);
      const userObj = savedUser ? JSON.parse(savedUser) : dummyUser;
      localStorage.setItem('mm_user_current', JSON.stringify(userObj));
      setUser(userObj);
      setIsAuthenticated(true);
      return { success: true, data: userObj };
    }
  };

  const signup = async (formData) => {
    if (isSupabaseConfigured()) {
      // 1. Create Auth user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_id_field: formData.userId,
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // 2. Insert record into public.users table
      if (data?.user) {
        const { error: dbError } = await supabase.from('users').upsert([{
          id: data.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          user_id_field: formData.userId,
          email: formData.email,
          role: 'HR_Manager',
          profile_picture_url: formData.profilePicture || null,
        }]);

        if (dbError) {
          console.warn('Warning: Could not insert into public.users table:', dbError.message);
        }
      }

      return { success: true, data };
    } else {
      // Dummy mode signup
      const newUser = {
        id: `usr-${Date.now()}`,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_id_field: formData.userId,
        role: 'HR_Manager',
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(`mm_user_${formData.userId}`, JSON.stringify(newUser));
      return { success: true, data: { message: 'Account created successfully!' } };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('mm_authenticated');
    localStorage.removeItem('mm_user_current');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user: user || dummyUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
