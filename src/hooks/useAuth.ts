import { useState, useEffect } from 'react';
import { User as SupaUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as LegacyUser, UserRole, Permission } from '@/types/artifact';

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
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Admin helpers
  const getAllUsers = () => allUsers;

  const createUser = async (formData: { name: string; email: string; department: string; role: UserRole; tempPassword: string; }) => {
    try {
      // Store current session to restore later
      const currentSession = session;
      
      // Create the user account in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.tempPassword,
        user_metadata: {
          name: formData.name,
          department: formData.department,
          role: formData.role,
        }
      });

      if (error) throw error;

      // Create or update the profile with the correct data
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: data.user.id,
            name: formData.name,
            email: formData.email,
            department: formData.department,
            role: formData.role,
            is_active: true,
          });

        if (profileError) throw profileError;
      }

      await fetchAllUsers();
      return data.user;
    } catch (error) {
      // Store current session to restore later
      const currentSession = session;
      
      console.warn('Admin user creation failed, falling back to regular signup:', error);
      
      const { data, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.tempPassword,
        options: {
          data: {
            name: formData.name,
            department: formData.department,
            role: formData.role,
          }
        }
      });

      if (signupError) throw signupError;

      // Update profile with correct data
      if (data.user) {
        await supabase
          .from('profiles')
          .update({
            name: formData.name,
            department: formData.department,
            role: formData.role,
            is_active: true,
          })
          .eq('user_id', data.user.id);
      }

      // Restore the original admin session
      if (currentSession) {
        await supabase.auth.setSession(currentSession);
      }

      await fetchAllUsers();
      return data.user;
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
      // Try to delete the user from auth (requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.warn('Could not delete auth user, marking as inactive:', authError);
        // Fallback to marking as inactive
        const { error } = await supabase.from('profiles').update({ is_active: false }).eq('user_id', userId);
        if (error) throw error;
      } else {
        // If auth user was deleted, the profile will be cascade deleted by the foreign key
      }
    } catch (error) {
      // Fallback to marking as inactive
      const { error: updateError } = await supabase.from('profiles').update({ is_active: false }).eq('user_id', userId);
      if (updateError) throw updateError;
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