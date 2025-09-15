import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, User, Package, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { supabase } from '@/integrations/supabase/client';
import { ArtifactHistory } from '@/types/artifact';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/common/PageHeader';
import { usePageTitle } from '@/hooks/usePageTitle';

const History = () => {
  usePageTitle('history');
  const { profile } = useAuth();
  const { t } = useTranslation(['pages', 'common']);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<ArtifactHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Set up real-time updates for artifact history
  useRealtime(
    'artifact_history',
    () => {
      console.log('Real-time: New history entry added');
      fetchHistory();
    },
    () => {
      console.log('Real-time: History entry updated');
      fetchHistory();
    },
    () => {
      console.log('Real-time: History entry deleted');
      fetchHistory();
    }
  );

  // Also listen for artifact changes to update history
  useRealtime(
    'artifacts',
    () => fetchHistory(), // New artifact
    () => fetchHistory(), // Updated artifact
    () => fetchHistory()  // Deleted artifact
  );

  useEffect(() => {
    fetchHistory();
    fetchUsers();
  }, []);

  // Refresh data when user changes
  useEffect(() => {
    fetchUsers();
  }, [profile]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      // First, get artifact history
      const { data: historyData, error: historyError } = await supabase
        .from('artifact_history')
        .select('*')
        .order('edited_at', { ascending: false });

      if (historyError) throw historyError;

      // Then get artifacts to match titles
      const { data: artifactsData, error: artifactsError } = await supabase
        .from('artifacts')
        .select('id, title, accession_number');

      if (artifactsError) throw artifactsError;

      const formattedHistory: ArtifactHistory[] = historyData.map(item => {
        const artifact = artifactsData.find(a => a.id === item.artifact_id);
        return {
          id: item.id,
          artifactId: item.artifact_id,
          action: item.action as 'created' | 'updated' | 'deleted',
          changes: (item.changes || {}) as Record<string, { old: any; new: any }>,
          editedBy: item.edited_by,
          editedAt: item.edited_at,
          notes: item.notes,
          artifactTitle: artifact?.title || 'Unknown Artifact'
        };
      });

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only admins can view history
  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('pages:history.accessDenied')}</CardTitle>
            <CardDescription>
              {t('pages:history.adminOnly')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'System';
    const user = allUsers.find(u => u.user_id === userId);
    return user?.name || 'System';
  };

  const filteredHistory = history.filter((entry) => {
    const userName = getUserName(entry.editedBy);
    const term = searchTerm.toLowerCase();
    const matchesSearch = (userName || '').toLowerCase().includes(term) ||
      ((entry.editedBy || '').toLowerCase().includes(term)) ||
      ((entry.notes || '').toLowerCase().includes(term)) ||
      ((entry.artifactTitle || '').toLowerCase().includes(term));

    const matchesAction = selectedAction === 'all' || entry.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '✨';
      case 'updated': return '✏️';
      case 'deleted': return '🗑️';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader pageKey="history" />
      <div>
        <p className="text-muted-foreground">
          {t('pages:history.subtitle')} ({filteredHistory.length} entries)
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('pages:history.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('pages:history.allActions')}</SelectItem>
              <SelectItem value="created">{t('pages:history.created')}</SelectItem>
              <SelectItem value="updated">{t('pages:history.updated')}</SelectItem>
              <SelectItem value="deleted">{t('pages:history.deleted')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('pages:history.loadingHistory')}</h3>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('history:noHistoryFound')}</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedAction !== 'all'
              ? t('history:adjustCriteria')
              : t('history:noChangesRecorded')
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory
            .sort((a, b) => new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime())
            .map((entry) => {
              return (
                <Card key={entry.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getActionIcon(entry.action)}</div>
                        <div>
                          <CardTitle className="text-lg">
                            {entry.artifactTitle}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            ID: {entry.artifactId}
                          </p>
                        </div>
                      </div>
                      <Badge className={getActionColor(entry.action)}>
                        {t(`pages:history.${entry.action}`)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {getUserName(entry.editedBy)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(entry.editedAt), 'PPpp')}
                      </div>
                    </div>
                    
                      {entry.notes && (
                        <p className="text-sm bg-muted p-3 rounded-md">
                          <strong>{t('pages:history.notes')}:</strong> {entry.notes}
                        </p>
                     )}
                     
                     {Object.keys(entry.changes).length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">{t('pages:history.changes')}:</h4>
                        <div className="space-y-2">
                          {Object.entries(entry.changes).map(([field, change]) => (
                            <div key={field} className="bg-muted p-3 rounded-md text-sm">
                              <div className="font-medium mb-1 capitalize">
                                {field.replace(/([A-Z])/g, ' $1').trim()}:
                              </div>
                               <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-red-600 font-medium">{t('pages:history.before')}:</span>
                                   <p className="mt-1 p-2 bg-red-50 rounded border">
                                     {typeof change.old === 'object' 
                                       ? JSON.stringify(change.old, null, 2)
                                       : String(change.old)
                                     }
                                   </p>
                                 </div>
                                  <div>
                                    <span className="text-green-600 font-medium">{t('pages:history.after')}:</span>
                                   <p className="mt-1 p-2 bg-green-50 rounded border">
                                     {typeof change.new === 'object' 
                                       ? JSON.stringify(change.new, null, 2)
                                       : String(change.new)
                                     }
                                   </p>
                                 </div>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default History;