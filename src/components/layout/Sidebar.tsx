import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Plus, 
  Search, 
  History, 
  Users, 
  Settings, 
  LogOut,
  Building,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, permissions, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: BarChart3,
      show: true,
    },
    {
      name: 'Artifacts',
      href: '/artifacts',
      icon: Package,
      show: true,
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      show: true,
    },
    {
      name: 'History',
      href: '/history',
      icon: History,
      show: user?.role === 'admin',
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileText,
      show: permissions?.canExport,
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      show: permissions?.canManageUsers,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      show: true,
    },
  ];

  const filteredNavigation = navigation.filter(item => item.show);

  return (
    <div className={cn(
      "flex flex-col border-r bg-card transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-museum-gold" />
            <span className="font-semibold text-museum-bronze">Museum CRM</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link key={item.name} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed && "px-2",
                    isActive && "bg-museum-gold/10 text-museum-bronze font-medium"
                  )}
                >
                  <Icon className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
                  {!collapsed && item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        {!collapsed && user && (
          <div className="mb-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive",
            collapsed && "px-2"
          )}
        >
          <LogOut className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;