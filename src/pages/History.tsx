import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, User, Package, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockHistory, mockArtifacts } from '@/data/mockArtifacts';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  
  const filteredHistory = mockHistory.filter(entry => {
    const artifact = mockArtifacts.find(a => a.id === entry.artifactId);
    const artifactTitle = artifact?.title || '';
    
    const matchesSearch = artifactTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.editedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
      <div>
        <h1 className="text-3xl font-bold text-museum-bronze">Edit History</h1>
        <p className="text-muted-foreground">
          Track all changes made to artifacts ({filteredHistory.length} entries)
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by artifact, user, or notes..."
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
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No history found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedAction !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No changes have been recorded yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory
            .sort((a, b) => new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime())
            .map((entry) => {
              const artifact = mockArtifacts.find(a => a.id === entry.artifactId);
              
              return (
                <Card key={entry.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getActionIcon(entry.action)}</div>
                        <div>
                          <CardTitle className="text-lg">
                            {artifact?.title || 'Unknown Artifact'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {artifact?.accessionNumber}
                          </p>
                        </div>
                      </div>
                      <Badge className={getActionColor(entry.action)}>
                        {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.editedBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(entry.editedAt), 'PPpp')}
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <p className="text-sm bg-muted p-3 rounded-md">
                        <strong>Notes:</strong> {entry.notes}
                      </p>
                    )}
                    
                    {Object.keys(entry.changes).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Changes:</h4>
                        <div className="space-y-2">
                          {Object.entries(entry.changes).map(([field, change]) => (
                            <div key={field} className="bg-muted p-3 rounded-md text-sm">
                              <div className="font-medium mb-1 capitalize">
                                {field.replace(/([A-Z])/g, ' $1').trim()}:
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-red-600 font-medium">Before:</span>
                                  <p className="mt-1 p-2 bg-red-50 rounded border">
                                    {typeof change.old === 'object' 
                                      ? JSON.stringify(change.old, null, 2)
                                      : String(change.old)
                                    }
                                  </p>
                                </div>
                                <div>
                                  <span className="text-green-600 font-medium">After:</span>
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