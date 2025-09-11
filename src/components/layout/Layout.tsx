import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-museum-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-museum-gold/5">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-museum-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-museum-gold-foreground">🏛️</span>
            </div>
            <h1 className="text-3xl font-bold text-museum-bronze mb-2">Museum CRM</h1>
            <p className="text-muted-foreground">Professional artifact management system</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please connect Firebase authentication to access the system
            </p>
            <div className="p-4 bg-muted rounded-lg text-left text-sm">
              <h3 className="font-medium mb-2">Integration Steps:</h3>
              <ol className="space-y-1 text-muted-foreground">
                <li>1. Set up Firebase project</li>
                <li>2. Configure authentication</li>
                <li>3. Update Firebase config</li>
                <li>4. Test login functionality</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;