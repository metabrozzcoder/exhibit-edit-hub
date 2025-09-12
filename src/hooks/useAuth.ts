import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, Permission } from '@/types/artifact';

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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            setProfile(profileData);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const permissions = profile ? rolePermissions[profile.role as UserRole] : rolePermissions.viewer;

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
  };

  return {
    user,
    profile,
    session,
    isLoading,
    permissions,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };
};