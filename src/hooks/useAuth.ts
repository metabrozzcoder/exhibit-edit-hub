import { useState, useEffect } from 'react';
import { User, UserRole, Permission } from '@/types/artifact';

// Mock users database - replace with Firebase auth
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin',
    name: 'Admin User',
    role: 'admin',
    department: 'Administration',
    createdAt: '2024-01-01',
    lastLogin: '2024-12-10',
    isActive: true,
  },
  {
    id: '2',
    email: 'admin@museum.org',
    name: 'Museum Admin',
    role: 'admin',
    department: 'Administration',
    createdAt: '2024-01-01',
    lastLogin: '2024-12-10',
    isActive: true,
  },
  {
    id: '3',
    email: 'curator@museum.org',
    name: 'Jane Smith',
    role: 'curator',
    department: 'Ancient Art',
    createdAt: '2024-01-01',
    lastLogin: '2024-12-10',
    isActive: true,
  },
  {
    id: '4',
    email: 'researcher@museum.org',
    name: 'John Doe',
    role: 'researcher',
    department: 'Modern Art',
    createdAt: '2024-02-01',
    lastLogin: '2024-12-09',
    isActive: true,
  },
  {
    id: '5',
    email: 'viewer@museum.org',
    name: 'Alice Johnson',
    role: 'viewer',
    department: 'Visitor Services',
    createdAt: '2024-03-01',
    lastLogin: '2024-12-08',
    isActive: false,
  },
];

// Mock current user
const mockUser: User = mockUsers[0]; // Default to admin

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
  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Simulate loading user from Firebase
    const savedUser = localStorage.getItem('currentUser');
    setTimeout(() => {
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }, 1000);
  }, []);

  const permissions = user ? rolePermissions[user.role] : null;

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setIsLoading(true);
      
      // Simple admin credentials for testing
      if ((email === 'admin' && password === 'admin') || 
          (email === 'admin@museum.org' && password === 'admin')) {
        setTimeout(() => {
          const adminUser = users.find(u => u.email === email) || users[0];
          const updatedUser = { ...adminUser, lastLogin: new Date().toISOString().split('T')[0] };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setIsLoading(false);
          resolve();
        }, 1000);
        return;
      }

      // Simulate authentication for other users
      const foundUser = users.find(u => u.email === email);
      if (foundUser && foundUser.isActive) {
        setTimeout(() => {
          const updatedUser = { ...foundUser, lastLogin: new Date().toISOString().split('T')[0] };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setIsLoading(false);
          resolve();
        }, 1000);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          reject(new Error('Invalid credentials'));
        }, 1000);
      }
    });
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    department: string;
    role: UserRole;
  }) => {
    // Replace with Firebase auth
    setIsLoading(true);
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === formData.email);
    if (existingUser) {
      setTimeout(() => {
        setIsLoading(false);
        throw new Error('User already exists');
      }, 1000);
      return;
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name,
      role: formData.role,
      department: formData.department,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    setTimeout(() => {
      setUsers(prev => [...prev, newUser]);
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const getAllUsers = () => {
    return users;
  };

  const createUser = async (formData: {
    name: string;
    email: string;
    department: string;
    role: UserRole;
    tempPassword: string;
  }) => {
    // Replace with Firebase admin functions
    const existingUser = users.find(u => u.email === formData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: formData.email,
      name: formData.name,
      role: formData.role,
      department: formData.department,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      isActive: true,
    };

    setUsers(prev => [...prev, newUser]);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    // Replace with Firebase admin functions
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
  };

  const toggleUserActive = async (userId: string) => {
    // Replace with Firebase admin functions
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
  };

  const deleteUser = async (userId: string) => {
    // Replace with Firebase admin functions
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Replace with Firebase auth
    // Simulate password validation and update
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return {
    user,
    permissions,
    isLoading,
    login,
    register,
    logout,
    getAllUsers,
    createUser,
    updateUserRole,
    toggleUserActive,
    deleteUser,
    changePassword,
    isAuthenticated: !!user,
  };
};