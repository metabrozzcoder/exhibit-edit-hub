import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Report, ReportType, ReportStatus, ReportPriority } from '@/types/report';
import { Search, Eye, Trash2, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

const ReportsList = () => {
  const { reports, deleteReport, searchReports } = useReports();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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
      title: "Report Deleted",
      description: "The report has been successfully deleted.",
    });
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
            Reports Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Conservation">Conservation</SelectItem>
                <SelectItem value="Condition Assessment">Condition Assessment</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
                <SelectItem value="Acquisition">Acquisition</SelectItem>
                <SelectItem value="Exhibition">Exhibition</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
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
                <TableHead>Report</TableHead>
                <TableHead>Artifact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
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
                        {report.createdBy}
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
                              <AlertDialogTitle>Delete Report</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this report? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteReport(report.id)}>
                                Delete
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
              No reports found matching your criteria.
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
                  <span className="font-medium">Artifact:</span> {selectedReport.artifactTitle}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedReport.reportType}
                </div>
                <div>
                  <span className="font-medium">Priority:</span>
                  <Badge variant={getPriorityColor(selectedReport.priority)} className="ml-2">
                    {selectedReport.priority}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant={getStatusColor(selectedReport.status)} className="ml-2">
                    {selectedReport.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Created by:</span> {selectedReport.createdBy}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {format(new Date(selectedReport.createdAt), 'PPP')}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Content</h4>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {selectedReport.content}
                </div>
              </div>

              {selectedReport.findings && (
                <div>
                  <h4 className="font-medium mb-2">Key Findings</h4>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {selectedReport.findings}
                  </div>
                </div>
              )}

              {selectedReport.recommendations && (
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                    {selectedReport.recommendations}
                  </div>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ReportsList;