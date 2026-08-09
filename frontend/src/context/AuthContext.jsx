import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, writeAuditLog } from '../lib/supabase';
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
      // Dummy mode - check localStorage
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
    const inputIdentifier = credentials.email || credentials.userId || '';

    if (isSupabaseConfigured()) {
      let emailToUse = inputIdentifier;

      // If input doesn't contain '@', try looking up email in public.users table by user_id_field
      if (!emailToUse.includes('@')) {
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('user_id_field', inputIdentifier)
          .maybeSingle();

        if (userData && userData.email) {
          emailToUse = userData.email;
        } else {
          return {
            success: false,
            error: `Account with identifier "${inputIdentifier}" not found. Please check your email or sign up.`
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
      await writeAuditLog({
        action: 'USER_LOGIN',
        entityType: 'auth',
        details: `User logged in: ${fullProfile.email}`,
        userEmail: fullProfile.email,
      });
      return { success: true, data: fullProfile };
    } else {
      // Dummy mode login - match by email or userId
      localStorage.setItem('mm_authenticated', 'true');
      const savedUserKey = localStorage.getItem(`mm_user_${inputIdentifier}`);
      let userObj;

      if (savedUserKey) {
        userObj = JSON.parse(savedUserKey);
      } else {
        // Default to dummyUser with input email
        userObj = { ...dummyUser, email: inputIdentifier.includes('@') ? inputIdentifier : dummyUser.email };
      }

      localStorage.setItem('mm_user_current', JSON.stringify(userObj));
      setUser(userObj);
      setIsAuthenticated(true);
      await writeAuditLog({
        action: 'USER_LOGIN',
        entityType: 'auth',
        details: `User logged in: ${userObj.email}`,
        userEmail: userObj.email,
      });
      return { success: true, data: userObj };
    }
  };

  const signup = async (formData) => {
    // Auto-generate system User ID if not provided (e.g. jessica.smith)
    const generatedUserId = formData.userId || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`;
    const selectedRole = formData.role || 'HR_Manager';

    if (isSupabaseConfigured()) {
      // 1. Create Auth user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_id_field: generatedUserId,
            role: selectedRole,
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
          user_id_field: generatedUserId,
          email: formData.email,
          role: selectedRole,
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
        user_id_field: generatedUserId,
        role: selectedRole,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(`mm_user_${formData.email}`, JSON.stringify(newUser));
      localStorage.setItem(`mm_user_${generatedUserId}`, JSON.stringify(newUser));
      return { success: true, data: { message: 'Account created successfully!' } };
    }
  };

  const switchRole = async (newRole) => {
    const activeUser = user || dummyUser;
    const updated = { ...activeUser, role: newRole };
    setUser(updated);
    localStorage.setItem('mm_user_current', JSON.stringify(updated));

    if (isSupabaseConfigured() && activeUser.id) {
      try {
        await supabase
          .from('users')
          .update({ role: newRole })
          .eq('id', activeUser.id);
      } catch (err) {
        console.warn('[Auth] Could not update user role in Supabase:', err.message);
      }
    }

    await writeAuditLog({
      action: 'ROLE_SWITCHED',
      entityType: 'auth',
      details: `Switched active user role to ${newRole}`,
      userEmail: updated.email,
    });
  };

  const logout = async () => {
    await writeAuditLog({
      action: 'USER_LOGOUT',
      entityType: 'auth',
      details: `User logged out: ${user?.email || 'unknown'}`,
      userEmail: user?.email,
    });
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
    switchRole,
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
