import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Eye, Users, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { mockArtifacts } from '@/data/mockArtifacts';

const Dashboard = () => {
  const totalArtifacts = mockArtifacts.length;
  const onDisplayCount = mockArtifacts.filter(a => a.isOnDisplay).length;
  const needsAttentionCount = mockArtifacts.filter(a => 
    a.condition === 'Poor' || a.condition === 'Damaged'
  ).length;
  const recentAcquisitions = mockArtifacts.filter(a => {
    const acquisitionDate = new Date(a.acquisitionDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return acquisitionDate > sixMonthsAgo;
  }).length;

  const stats = [
    {
      title: 'Total Artifacts',
      value: totalArtifacts,
      icon: Package,
      description: 'In collection',
      color: 'text-museum-bronze'
    },
    {
      title: 'On Display',
      value: onDisplayCount,
      icon: Eye,
      description: 'Currently exhibited',
      color: 'text-heritage-blue'
    },
    {
      title: 'Recent Acquisitions',
      value: recentAcquisitions,
      icon: TrendingUp,
      description: 'Last 6 months',
      color: 'text-museum-gold'
    },
    {
      title: 'Need Attention',
      value: needsAttentionCount,
      icon: AlertTriangle,
      description: 'Poor/Damaged condition',
      color: 'text-destructive'
    }
  ];

  const recentActivity = [
    {
      action: 'Added new artifact',
      artifact: 'Roman Glass Unguentarium',
      user: 'Dr. Sarah Johnson',
      time: '2 hours ago',
      type: 'create'
    },
    {
      action: 'Updated condition',
      artifact: 'Ancient Greek Amphora',
      user: 'Mark Stevens',
      time: '5 hours ago',
      type: 'update'
    },
    {
      action: 'Moved to storage',
      artifact: 'Egyptian Canopic Jar',
      user: 'Dr. Sarah Johnson',
      time: '1 day ago',
      type: 'update'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-museum-bronze">Dashboard</h1>
        <p className="text-muted-foreground">Museum Collection Overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'create' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.artifact} by {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Items Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockArtifacts
                .filter(a => a.condition === 'Poor' || a.condition === 'Damaged')
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
      </div>
    </div>
  );
};

export default Dashboard;