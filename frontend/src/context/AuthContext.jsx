// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Authentication Context
// Implements:
//   [FR-01: USER LOGIN & CREDENTIAL VALIDATION]
//   [FR-02: ROLE-BASED ACCESS CONTROL (RBAC: Admin vs HR_Manager)]
//   [FR-19: PROFILE MANAGEMENT & PASSWORD SECURITY]
//   [FR-21: SYSTEM AUDIT LOGGING FOR AUTH EVENTS]
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, writeAuditLog } from '../lib/supabase';
import { dummyUser } from '../lib/dummyData';

const AuthContext = createContext();

/**
 * [FR-02: RBAC] Formats and resolves active user role permissions
 */
const formatUserProfile = (sessionUser, dbUser) => {
  if (!sessionUser && !dbUser) return null;
  const meta = sessionUser?.user_metadata || {};
  
  // Resolve actual role (Admin or HR_Manager)
  let userRole = dbUser?.role || meta.role || 'HR_Manager';
  if (userRole === 'authenticated') {
    userRole = meta.role || 'HR_Manager';
  }

  return {
    id: dbUser?.id || sessionUser?.id,
    email: dbUser?.email || sessionUser?.email,
    first_name: dbUser?.first_name || meta.first_name || 'User',
    last_name: dbUser?.last_name || meta.last_name || '',
    user_id_field: dbUser?.user_id_field || meta.user_id_field || '',
    role: userRole,
    avatar_url: dbUser?.profile_picture_url || meta.profile_picture_url || null,
    created_at: dbUser?.created_at || sessionUser?.created_at,
    user_metadata: meta,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * [FR-01: User Login] Session Check & Token Restoration
   */
  const checkAuth = async () => {
    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser(formatUserProfile(session.user, dbUser));
          setIsAuthenticated(true);
        }
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const { data: dbUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            setUser(formatUserProfile(session.user, dbUser));
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        });
      } catch (err) {
        console.warn('Supabase auth session check failed:', err);
      }
    } else {
      // LocalStorage / Demo Mode fallback
      const storedAuth = localStorage.getItem('mm_authenticated');
      if (storedAuth === 'true') {
        const storedUser = localStorage.getItem('mm_user_current');
        setUser(storedUser ? JSON.parse(storedUser) : dummyUser);
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  };

  /**
   * [FR-01: User Login & Credential Verification]
   * Authenticates registered users with email/User ID and password
   */
  const login = async (credentials) => {
    const inputIdentifier = (credentials.email || credentials.userId || '').trim();
    const inputPassword = credentials.password || '';

    if (!inputIdentifier) {
      return { success: false, error: 'Email address or User ID is required.' };
    }
    if (!inputPassword) {
      return { success: false, error: 'Password is required.' };
    }

    if (isSupabaseConfigured()) {
      let emailToUse = inputIdentifier;

      // Check if input was a User ID instead of an email
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
            error: `No account found with User ID "${inputIdentifier}". Please check your credentials or sign up.`
          };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: inputPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const fullProfile = formatUserProfile(data.user, dbUser);
      setUser(fullProfile);
      setIsAuthenticated(true);

      // [FR-21: Audit Logging]
      await writeAuditLog({
        action: 'USER_LOGIN',
        entityType: 'auth',
        details: `User logged in: ${fullProfile.email} (${fullProfile.role})`,
        userEmail: fullProfile.email,
      });
      return { success: true, data: fullProfile };
    } else {
      // Demo / LocalStorage mode validation
      const cleanId = inputIdentifier.toLowerCase();

      // Check if user matches saved custom registered user
      const savedUserStr = localStorage.getItem(`mm_user_${cleanId}`);
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.password && savedUser.password !== inputPassword) {
          return {
            success: false,
            error: 'Invalid password. Please try again.'
          };
        }
        localStorage.setItem('mm_user_current', JSON.stringify(savedUser));
        localStorage.setItem('mm_authenticated', 'true');
        setUser(savedUser);
        setIsAuthenticated(true);

        // [FR-21: Audit Logging]
        await writeAuditLog({
          action: 'USER_LOGIN',
          entityType: 'auth',
          details: `User logged in: ${savedUser.email} (${savedUser.role})`,
          userEmail: savedUser.email,
        });
        return { success: true, data: savedUser };
      }

      // Default Admin account: admin@modernmatrix.com (or username 'admin')
      if (cleanId === 'admin@modernmatrix.com' || cleanId === 'admin') {
        const adminUser = { ...dummyUser, role: 'Admin' };
        localStorage.setItem('mm_user_current', JSON.stringify(adminUser));
        localStorage.setItem('mm_authenticated', 'true');
        setUser(adminUser);
        setIsAuthenticated(true);

        // [FR-21: Audit Logging]
        await writeAuditLog({
          action: 'USER_LOGIN',
          entityType: 'auth',
          details: `Admin logged in: ${adminUser.email}`,
          userEmail: adminUser.email,
        });
        return { success: true, data: adminUser };
      }

      // Default HR Manager account: hr@modernmatrix.com (or username 'hr')
      if (cleanId === 'hr@modernmatrix.com' || cleanId === 'hr') {
        const hrUser = {
          id: 'usr-002',
          email: 'hr@modernmatrix.com',
          first_name: 'Amali',
          last_name: 'Silva',
          user_id_field: 'amali.silva',
          role: 'HR_Manager',
          avatar_url: null,
          created_at: '2026-01-15T08:00:00Z',
        };
        localStorage.setItem('mm_user_current', JSON.stringify(hrUser));
        localStorage.setItem('mm_authenticated', 'true');
        setUser(hrUser);
        setIsAuthenticated(true);

        // [FR-21: Audit Logging]
        await writeAuditLog({
          action: 'USER_LOGIN',
          entityType: 'auth',
          details: `HR Manager logged in: ${hrUser.email}`,
          userEmail: hrUser.email,
        });
        return { success: true, data: hrUser };
      }

      // If account does not exist
      return {
        success: false,
        error: `No registered account found for "${inputIdentifier}". Please check your email or create a new account.`
      };
    }
  };

  /**
   * [FR-01: User Registration]
   * Creates new HR Manager or Admin profile with duplicate email checks
   */
  const signup = async (formData) => {
    const cleanEmail = (formData.email || '').toLowerCase().trim();
    const generatedUserId = (formData.userId || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}`).trim();
    const selectedRole = formData.role || 'HR_Manager';

    if (!cleanEmail) {
      return { success: false, error: 'Email address is required.' };
    }

    if (isSupabaseConfigured()) {
      // 1. Check if email already exists in public.users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingUser) {
        return {
          success: false,
          error: `An account with the email "${cleanEmail}" already exists. Please log in or use a different email.`
        };
      }

      // 2. Call Supabase Auth signUp
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
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

      // Detect duplicate user if Supabase returns empty identities array
      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          error: `An account with the email "${cleanEmail}" already exists. Please log in or use a different email.`
        };
      }

      if (data?.user) {
        const { error: dbError } = await supabase.from('users').upsert([{
          id: data.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          user_id_field: generatedUserId,
          email: cleanEmail,
          role: selectedRole,
          profile_picture_url: formData.profilePicture || null,
        }]);

        if (dbError) {
          console.warn('Warning: Could not insert into public.users table:', dbError.message);
        }

        if (data.session) {
          const profile = formatUserProfile(data.user, {
            id: data.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_id_field: generatedUserId,
            email: cleanEmail,
            role: selectedRole,
          });
          setUser(profile);
          setIsAuthenticated(true);
        }
      }

      // [FR-21: Audit Logging]
      await writeAuditLog({
        action: 'USER_REGISTERED',
        entityType: 'auth',
        details: `Registered new account: ${cleanEmail} (Role: ${selectedRole})`,
        userEmail: cleanEmail,
      });

      return { success: true, data };
    } else {
      // LocalStorage / Demo Mode Duplicate Checks
      const existingEmail = localStorage.getItem(`mm_user_${cleanEmail}`);
      if (existingEmail || cleanEmail === 'admin@modernmatrix.com' || cleanEmail === 'hr@modernmatrix.com') {
        return {
          success: false,
          error: `An account with the email "${cleanEmail}" already exists. Please log in or use a different email.`
        };
      }

      const existingUserId = localStorage.getItem(`mm_user_${generatedUserId.toLowerCase()}`);
      if (existingUserId) {
        return {
          success: false,
          error: `User ID "${generatedUserId}" is already taken. Please choose a different ID or name.`
        };
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        first_name: formData.firstName,
        last_name: formData.lastName,
        user_id_field: generatedUserId,
        role: selectedRole,
        password: formData.password,
        profile_picture_url: formData.profilePicture || null,
        created_at: new Date().toISOString(),
      };

      localStorage.setItem(`mm_user_${cleanEmail}`, JSON.stringify(newUser));
      localStorage.setItem(`mm_user_${generatedUserId.toLowerCase()}`, JSON.stringify(newUser));
      localStorage.setItem('mm_user_current', JSON.stringify(newUser));
      localStorage.setItem('mm_authenticated', 'true');
      setUser(newUser);
      setIsAuthenticated(true);

      // [FR-21: Audit Logging]
      await writeAuditLog({
        action: 'USER_REGISTERED',
        entityType: 'auth',
        details: `Registered new account: ${cleanEmail} (Role: ${selectedRole})`,
        userEmail: cleanEmail,
      });

      return { success: true, data: newUser };
    }
  };

  /**
   * [FR-02: RBAC Role Switching]
   * Allows live role switching for demonstration and testing
   */
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

    // [FR-21: Audit Logging]
    await writeAuditLog({
      action: 'ROLE_SWITCHED',
      entityType: 'auth',
      details: `Switched active user role to ${newRole}`,
      userEmail: updated.email,
    });
  };

  /**
   * [FR-01: User Logout]
   * Clears sessions and terminates active tokens
   */
  const logout = async () => {
    // [FR-21: Audit Logging]
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
    user: user || (isAuthenticated ? null : dummyUser),
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
