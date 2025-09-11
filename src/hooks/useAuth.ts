import { useState, useEffect } from 'react';
import { User, UserRole, Permission } from '@/types/artifact';

// Mock user data - replace with Firebase auth
const mockUser: User = {
  id: '1',
  email: 'curator@museum.org',
  name: 'Jane Smith',
  role: 'curator',
  department: 'Ancient Art',
  createdAt: '2024-01-01',
  lastLogin: '2024-12-10',
  isActive: true,
};

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user from Firebase
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 1000);
  }, []);

  const permissions = user ? rolePermissions[user.role] : null;

  const login = async (email: string, password: string) => {
    // Replace with Firebase auth
    setIsLoading(true);
    setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    permissions,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};