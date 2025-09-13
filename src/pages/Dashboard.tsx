import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Eye, Users, TrendingUp, AlertTriangle, Calendar, MapPin, Warehouse, UserCheck, ArrowRight } from 'lucide-react';
import { useArtifacts } from '@/hooks/useArtifacts';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { artifacts } = useArtifacts();
  const { getAllUsers, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['dashboard', 'common']);
  
  const totalArtifacts = artifacts.length;
  const inVitrineCount = artifacts.filter(a => a.location === 'vitrine').length;
  const inWarehouseCount = artifacts.filter(a => a.location === 'warehouse').length;
  const needsAttentionCount = artifacts.filter(a => 
    a.condition === 'Poor' || a.condition === 'Damaged' || a.condition === 'Fair'
  ).length;
  
  const recentAcquisitions = artifacts.filter(a => {
    const acquisitionDate = new Date(a.acquisitionDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return acquisitionDate > sixMonthsAgo;
  }).length;

  const allUsers = getAllUsers();
  const activeUsers = allUsers.filter(u => u.isActive).length;
  
  // Get most valuable artifacts
  const mostValuableArtifacts = artifacts
    .sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0))
    .slice(0, 3);

  // Get recent artifacts (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentArtifacts = artifacts
    .filter(a => new Date(a.createdAt) > thirtyDaysAgo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Collection value
  const totalValue = artifacts.reduce((sum, artifact) => sum + (artifact.estimatedValue || 0), 0);

  const stats = [
    {
      title: t('dashboard:totalArtifacts'),
      value: totalArtifacts,
      icon: Package,
      description: t('dashboard:inCollection'),
      color: 'text-museum-bronze',
      onClick: () => navigate('/artifacts')
    },
    {
      title: t('dashboard:inVitrine'),
      value: inVitrineCount,
      icon: Eye,
      description: t('dashboard:currentlyExhibited'),
      color: 'text-heritage-blue',
      onClick: () => navigate('/search?location=vitrine')
    },
    {
      title: t('dashboard:activeUsers'),
      value: activeUsers,
      icon: Users,
      description: t('dashboard:ofTotalUsers', { total: allUsers.length }),
      color: 'text-museum-gold',
      onClick: () => navigate('/users')
    },
    {
      title: t('dashboard:needAttention'),
      value: needsAttentionCount,
      icon: AlertTriangle,
      description: t('dashboard:conditionIssues'),
      color: 'text-destructive',
      onClick: () => navigate('/search?condition=fair')
    }
  ];

  const locationStats = [
    {
      title: 'Vitrine Items',
      value: inVitrineCount,
      icon: MapPin,
      percentage: Math.round((inVitrineCount / totalArtifacts) * 100) || 0
    },
    {
      title: 'Warehouse Items', 
      value: inWarehouseCount,
      icon: Warehouse,
      percentage: Math.round((inWarehouseCount / totalArtifacts) * 100) || 0
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-museum-bronze">{t('common:dashboard')}</h1>
        <p className="text-muted-foreground">{t('dashboard:museumCollectionOverview')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={stat.onClick}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Location Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {locationStats.map((location) => {
              const Icon = location.icon;
              return (
                <div key={location.title} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{location.title}</p>
                      <p className="text-sm text-muted-foreground">{location.percentage}% of collection</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{location.value}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Artifacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Additions
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/artifacts')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArtifacts.length > 0 ? recentArtifacts.map((artifact) => (
                <div key={artifact.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 bg-green-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{artifact.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {artifact.accessionNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(artifact.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No recent additions</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items Needing Attention */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Needs Attention
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {artifacts
                .filter(a => a.condition === 'Poor' || a.condition === 'Damaged' || a.condition === 'Fair')
                .slice(0, 4)
                .map((artifact) => (
                  <div key={artifact.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{artifact.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {artifact.accessionNumber}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-destructive border-destructive">
                      {artifact.condition}
                    </Badge>
                  </div>
                ))}
              {needsAttentionCount === 0 && (
                <p className="text-sm text-muted-foreground">
                  All artifacts in good condition
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Valuable Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-museum-gold" />
              Most Valuable
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/artifacts')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostValuableArtifacts.map((artifact, index) => (
                <div key={artifact.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-museum-gold/20 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{artifact.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {artifact.accessionNumber}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-museum-gold">
                    ${artifact.estimatedValue?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Collection Value:</span>
                <span className="text-lg font-bold text-museum-gold">
                  ${totalValue.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/artifacts')}
            >
              <Package className="h-6 w-6" />
              <span>View Artifacts</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/search')}
            >
              <Eye className="h-6 w-6" />
              <span>Search Collection</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/users')}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => navigate('/reports')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;