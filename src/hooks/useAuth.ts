import { useState, useEffect } from 'react';
import { User as SupaUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as LegacyUser, UserRole, Permission } from '@/types/artifact';
import { useRealtime } from './useRealtime';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canManageUsers: true,
  },
  curator: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExport: true,
    canManageUsers: false,
  },
  researcher: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: true,
    canManageUsers: false,
  },
  viewer: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canManageUsers: false,
  },
};

export const useAuth = () => {
  const [authUser, setAuthUser] = useState<SupaUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<LegacyUser | null>(null);
  const [allUsers, setAllUsers] = useState<LegacyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapProfileToLegacy = (p: Profile): LegacyUser => ({
    id: p.user_id,
    email: p.email,
    name: p.name,
    role: p.role,
    department: p.department,
    createdAt: p.created_at,
    lastLogin: p.last_login,
    isActive: p.is_active,
  });

  const fetchAllUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      const mapped = data.map((d: any) => mapProfileToLegacy({ ...d, role: (d.role as UserRole) }));
      setAllUsers(mapped);
    }
  };

  // Set up real-time synchronization for profiles
  useRealtime(
    'profiles',
    () => fetchAllUsers(), // on insert
    () => fetchAllUsers(), // on update
    () => fetchAllUsers()  // on delete
  );

  const fetchProfileAndUsers = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileData) {
      const normalized: Profile = { ...profileData, role: (profileData.role as UserRole) };
      setProfile(normalized);
      setUser(mapProfileToLegacy(normalized));
    } else {
      setProfile(null);
      setUser(null);
    }

    await fetchAllUsers();
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuthUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchProfileAndUsers(session.user!.id);
          }, 0);
        } else {
          setProfile(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndUsers(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const permissions = user ? rolePermissions[user.role as UserRole] : rolePermissions.viewer;

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    department: string;
    role: UserRole;
  }) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: formData.name,
          department: formData.department,
          role: formData.role,
        }
      }
    });
    return { error };
  };

  const logout = async () => {
    try {
      // Clear local state first to prevent UI issues
      setUser(null);
      setProfile(null);
      setSession(null);
      setAllUsers([]);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Don't throw on session_not_found errors as user is already logged out
      if (error && error.message !== 'Session from session_id claim in JWT does not exist') {
        console.warn('Logout error:', error);
      }
    } catch (error) {
      console.warn('Logout error:', error);
      // Even if logout fails, user state is cleared locally
    }
  };

  // Admin helpers
  const getAllUsers = () => allUsers;

  const createUser = async (formData: { name: string; email: string; department: string; role: UserRole; tempPassword: string; }) => {
    try {
      // Call the edge function to create the user with admin privileges
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Failed to create user');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      console.log('User successfully created:', data.user);
      await fetchAllUsers();
      return data.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('user_id', userId);
    if (error) throw error;
    await fetchAllUsers();
  };

  const toggleUserActive = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('is_active').eq('user_id', userId).maybeSingle();
    const current = (data as any)?.is_active ?? true;
    const { error } = await supabase.from('profiles').update({ is_active: !current }).eq('user_id', userId);
    if (error) throw error;
    await fetchAllUsers();
  };

  const deleteUser = async (userId: string) => {
    try {
      // Call the edge function to delete the user with admin privileges
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Failed to delete user');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }

      console.log(`User ${data.action}:`, userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    await fetchAllUsers();
  };

  const changePassword = async (_currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  return {
    user,
    profile,
    session,
    isLoading,
    permissions,
    isAuthenticated: !!session,
    login,
    register,
    logout,
    getAllUsers,
    createUser,
    updateUserRole,
    toggleUserActive,
    deleteUser,
    changePassword,
  };
};