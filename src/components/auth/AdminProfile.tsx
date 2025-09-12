import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/artifact';
import { Eye, EyeOff, Plus, Edit, Trash2, UserCheck, UserX, Copy } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const AdminProfile = () => {
  const { user, permissions, getAllUsers, createUser, updateUserRole, toggleUserActive, deleteUser, changePassword } = useAuth();
  const { notifyUserCreated, notifySuccess, notifyError } = useNotifications();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    department: '',
    role: 'viewer' as UserRole,
    tempPassword: ''
  });

  const [generatedPassword, setGeneratedPassword] = useState('');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('viewer');

  const allUsers = getAllUsers();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserForm.name || !newUserForm.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const tempPassword = generatePassword();
      await createUser({ ...newUserForm, tempPassword });
      setGeneratedPassword(tempPassword);
      notifyUserCreated(newUserForm.name, newUserForm.email);
      setNewUserForm({
        name: '',
        email: '',
        department: '',
        role: 'viewer',
        tempPassword: ''
      });
      toast({
        title: "User created successfully",
        description: "User created with temporary password",
      });
    } catch (error) {
      notifyError('Failed to create user', 'An error occurred while creating the user account.');
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await toggleUserActive(userId);
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-heritage-blue text-heritage-blue-foreground';
      case 'curator':
        return 'bg-museum-gold text-museum-gold-foreground';
      case 'researcher':
        return 'bg-muted text-muted-foreground';
      case 'viewer':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!permissions?.canManageUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and user permissions
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{user?.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge className={getRoleBadgeColor(user?.role || 'viewer')}>
                    {user?.role}
                  </Badge>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="text-sm font-medium">{user?.department}</p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="text-sm font-medium">{user?.createdAt}</p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="text-sm font-medium">{user?.lastLogin}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
                <CardDescription>
                  Add a new user to the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Full Name *</Label>
                      <Input
                        id="user-name"
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email *</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@museum.org"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-department">Department</Label>
                      <Input
                        id="user-department"
                        value={newUserForm.department}
                        onChange={(e) => setNewUserForm(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="Ancient Art"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Role</Label>
                      <Select value={newUserForm.role} onValueChange={(value: UserRole) => setNewUserForm(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="researcher">Researcher</SelectItem>
                          <SelectItem value="curator">Curator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                </form>
                
                {generatedPassword && (
                  <div className="mt-6 p-4 bg-muted rounded-lg border">
                    <h3 className="font-semibold text-sm mb-2 text-museum-gold">Generated Password</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Save this password securely. The user will need it to log in.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={generatedPassword}
                        readOnly
                        className="font-mono text-sm bg-background"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedPassword);
                          toast({
                            title: "Copied!",
                            description: "Password copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setGeneratedPassword('')}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Users ({allUsers.length})</CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground">{user.department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={user.role} onValueChange={(value: UserRole) => handleUpdateRole(user.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="researcher">Researcher</SelectItem>
                            <SelectItem value="curator">Curator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(user.id)}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password (min 8 characters)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <Button type="submit">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProfile;