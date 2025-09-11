import { useState } from 'react';
import { Plus, Edit, Trash2, Shield, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/artifact';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@museum.org',
      name: 'Dr. Sarah Johnson',
      role: 'admin',
      department: 'Administration',
      createdAt: '2024-01-01',
      lastLogin: '2024-12-10',
      isActive: true,
    },
    {
      id: '2',
      email: 'curator@museum.org',
      name: 'Mark Stevens',
      role: 'curator',
      department: 'Ancient Art',
      createdAt: '2024-01-15',
      lastLogin: '2024-12-09',
      isActive: true,
    },
    {
      id: '3',
      email: 'researcher@museum.org',
      name: 'Dr. Emily Chen',
      role: 'researcher',
      department: 'Research',
      createdAt: '2024-02-01',
      lastLogin: '2024-12-08',
      isActive: true,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'curator': return 'bg-blue-100 text-blue-800';
      case 'researcher': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddUser = () => {
    toast({
      title: "Add user functionality",
      description: "User creation form would open here. Connect to Firebase Auth for full functionality.",
    });
  };

  const handleEditUser = (userId: string) => {
    toast({
      title: "Edit user functionality",
      description: "User editing form would open here.",
    });
  };

  const handleToggleActive = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
    
    const user = users.find(u => u.id === userId);
    toast({
      title: user?.isActive ? "User deactivated" : "User activated",
      description: `${user?.name} has been ${user?.isActive ? 'deactivated' : 'activated'}.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const user = users.find(u => u.id === userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast({
        title: "User deleted",
        description: `${user?.name} has been removed from the system.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-museum-bronze">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions ({filteredUsers.length} users)
          </p>
        </div>
        
        <Button 
          onClick={handleAddUser}
          className="bg-museum-gold hover:bg-museum-gold/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="curator">Curator</SelectItem>
            <SelectItem value="researcher">Researcher</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-museum-gold/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-museum-bronze">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      {user.department && (
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {user.department}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  {user.lastLogin && (
                    <div>
                      Last login: {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user.id)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(user.id)}
                    className={user.isActive ? "text-orange-600" : "text-green-600"}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  
                  {user.role !== 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedRole !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No users have been added yet'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default UsersPage;