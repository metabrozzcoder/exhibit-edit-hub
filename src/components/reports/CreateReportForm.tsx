import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useReports } from '@/hooks/useReports';
import { useArtifacts } from '@/hooks/useArtifacts';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { ReportType, ReportPriority, ReportStatus } from '@/types/report';
import { Save, FileText } from 'lucide-react';

interface CreateReportFormProps {
  onReportCreated?: () => void;
  selectedArtifactId?: string;
}

const CreateReportForm = ({ onReportCreated, selectedArtifactId }: CreateReportFormProps) => {
  const { createReport } = useReports();
  const { artifacts } = useArtifacts();
  const { user } = useAuth();
  const { notifyReportCreated, notifyError } = useNotifications();
  
  const [formData, setFormData] = useState({
    artifactId: selectedArtifactId || '',
    reportType: 'General' as ReportType,
    title: '',
    content: '',
    findings: '',
    recommendations: '',
    priority: 'Medium' as ReportPriority,
    status: 'Draft' as ReportStatus
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedArtifact = artifacts.find(art => art.id === formData.artifactId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.artifactId || !formData.title || !formData.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newReport = await createReport({
        ...formData,
        artifactTitle: selectedArtifact?.title || 'Unknown Artifact',
        createdBy: user?.id || 'Unknown User'
      });

      notifyReportCreated(formData.title, newReport?.id || 'new-report');

      toast({
        title: "Report Created",
        description: "Your report has been successfully created.",
      });

      // Reset form
      setFormData({
        artifactId: selectedArtifactId || '',
        reportType: 'General' as ReportType,
        title: '',
        content: '',
        findings: '',
        recommendations: '',
        priority: 'Medium' as ReportPriority,
        status: 'Draft' as ReportStatus
      });

      onReportCreated?.();
    } catch (error) {
      notifyError('Failed to create report', 'An error occurred while creating your report. Please try again.');
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create New Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="artifact">Artifact *</Label>
              <Select
                value={formData.artifactId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, artifactId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an artifact" />
                </SelectTrigger>
                <SelectContent>
                  {artifacts.map((artifact) => (
                    <SelectItem key={artifact.id} value={artifact.id}>
                      {artifact.accessionNumber} - {artifact.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type *</Label>
              <Select
                value={formData.reportType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value as ReportType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conservation">Conservation</SelectItem>
                  <SelectItem value="Condition Assessment">Condition Assessment</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Acquisition">Acquisition</SelectItem>
                  <SelectItem value="Exhibition">Exhibition</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter report title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Report Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter detailed report content..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="findings">Key Findings</Label>
            <Textarea
              id="findings"
              value={formData.findings}
              onChange={(e) => setFormData(prev => ({ ...prev, findings: e.target.value }))}
              placeholder="Summarize key findings..."
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea
              id="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Provide recommendations..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as ReportPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as ReportStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating Report...' : 'Create Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateReportForm;