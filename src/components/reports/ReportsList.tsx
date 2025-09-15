import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { useRealtime } from '@/hooks/useRealtime';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Report, ReportType, ReportStatus, ReportPriority } from '@/types/report';
import { Search, Eye, Trash2, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const ReportsList = () => {
  const { reports, deleteReport, searchReports } = useReports();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Set up real-time updates
  useRealtime(
    'reports',
    () => fetchUsers(), // Refresh users when reports change
    () => fetchUsers(),
    () => fetchUsers()
  );

  useRealtime(
    'profiles',
    () => fetchUsers(), // Refresh users when profiles change
    () => fetchUsers(),
    () => fetchUsers()
  );

  const filteredReports = searchReports(searchTerm).filter(report => {
    const typeMatch = filterType === 'all' || report.reportType === filterType;
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getPriorityColor = (priority: ReportPriority) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Under Review': return 'secondary';
      case 'Draft': return 'outline';
      case 'Archived': return 'secondary';
      default: return 'default';
    }
  };

  const handleDeleteReport = (reportId: string) => {
    deleteReport(reportId);
    toast({
      title: t('reports.reportDeleted'),
      description: t('reports.deleteSuccess'),
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Refresh users when user context changes
  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getUserName = (userId: string) => {
    const reportUser = allUsers.find(u => u.user_id === userId);
    return reportUser ? reportUser.name : 'Unknown User';
  };

  const canDelete = (report: Report) => {
    return user?.role === 'admin' || user?.id === report.createdBy;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('reports.reportsLibrary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('reports.searchReports')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('reports.filterByType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('reports.allTypes')}</SelectItem>
                <SelectItem value="Conservation">{t('reports.conservation')}</SelectItem>
                <SelectItem value="Condition Assessment">{t('reports.conditionAssessment')}</SelectItem>
                <SelectItem value="Research">{t('reports.research')}</SelectItem>
                <SelectItem value="Acquisition">{t('reports.acquisition')}</SelectItem>
                <SelectItem value="Exhibition">{t('reports.exhibition')}</SelectItem>
                <SelectItem value="General">{t('reports.general')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('reports.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('reports.allStatuses')}</SelectItem>
                <SelectItem value="Draft">{t('reports.draft')}</SelectItem>
                <SelectItem value="Under Review">{t('reports.underReview')}</SelectItem>
                <SelectItem value="Completed">{t('reports.completed')}</SelectItem>
                <SelectItem value="Archived">{t('reports.archived')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('reports.report')}</TableHead>
                <TableHead>{t('reports.artifact')}</TableHead>
                <TableHead>{t('reports.type')}</TableHead>
                <TableHead>{t('reports.priority')}</TableHead>
                <TableHead>{t('reports.status')}</TableHead>
                <TableHead>{t('reports.created')}</TableHead>
                <TableHead className="w-24">{t('reports.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {getUserName(report.createdBy)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{report.artifactTitle}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.reportType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canDelete(report) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('reports.delete')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('reports.deleteConfirm')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('reports.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteReport(report.id)}>
                                {t('reports.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredReports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t('reports.noReports')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Details Modal */}
      {selectedReport && (
        <AlertDialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedReport.title}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t('reports.artifact')}:</span> {selectedReport.artifactTitle}
                </div>
                <div>
                  <span className="font-medium">{t('reports.type')}:</span> {selectedReport.reportType}
                </div>
                <div>
                  <span className="font-medium">{t('reports.priority')}:</span>
                  <Badge variant={getPriorityColor(selectedReport.priority)} className="ml-2">
                    {selectedReport.priority}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">{t('reports.status')}:</span>
                  <Badge variant={getStatusColor(selectedReport.status)} className="ml-2">
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">{t('reports.createdBy')}:</span> {getUserName(selectedReport.createdBy)}
                </div>
                <div>
                  <span className="font-medium">{t('reports.created')}:</span> {format(new Date(selectedReport.createdAt), 'PPP')}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">{t('reports.content')}</h4>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {selectedReport.content}
                </div>
              </div>

              {selectedReport.findings && (
                <div>
                  <h4 className="font-medium mb-2">{t('reports.keyFindings')}</h4>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {selectedReport.findings}
                  </div>
                </div>
              )}

              {selectedReport.recommendations && (
                <div>
                  <h4 className="font-medium mb-2">{t('reports.recommendations')}</h4>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {selectedReport.recommendations}
                  </div>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('reports.close')}</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ReportsList;