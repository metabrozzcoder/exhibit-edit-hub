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
import { useTranslation } from 'react-i18next';

interface CreateReportFormProps {
  onReportCreated?: () => void;
  selectedArtifactId?: string;
}

const CreateReportForm = ({ onReportCreated, selectedArtifactId }: CreateReportFormProps) => {
  const { createReport } = useReports();
  const { artifacts } = useArtifacts();
  const { user } = useAuth();
  const { notifyReportCreated, notifyError } = useNotifications();
  const { t } = useTranslation();
  
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
        title: t('reports.missingInfo'),
        description: t('reports.fillRequired'),
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
        title: t('reports.reportCreated'),
        description: t('reports.successCreate'),
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
        title: t('common.error'),
        description: t('reports.errorCreate'),
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
          {t('reports.createReport')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="artifact">{t('reports.artifact')} {t('reports.required')}</Label>
              <Select
                value={formData.artifactId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, artifactId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('reports.selectArtifact')} />
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
              <Label htmlFor="reportType">{t('reports.reportType')} {t('reports.required')}</Label>
              <Select
                value={formData.reportType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value as ReportType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conservation">{t('reports.conservation')}</SelectItem>
                  <SelectItem value="Condition Assessment">{t('reports.conditionAssessment')}</SelectItem>
                  <SelectItem value="Research">{t('reports.research')}</SelectItem>
                  <SelectItem value="Acquisition">{t('reports.acquisition')}</SelectItem>
                  <SelectItem value="Exhibition">{t('reports.exhibition')}</SelectItem>
                  <SelectItem value="General">{t('reports.general')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">{t('reports.reportTitle')} {t('reports.required')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('reports.enterTitle')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t('reports.reportContent')} {t('reports.required')}</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={t('reports.enterContent')}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="findings">{t('reports.findings')}</Label>
            <Textarea
              id="findings"
              value={formData.findings}
              onChange={(e) => setFormData(prev => ({ ...prev, findings: e.target.value }))}
              placeholder={t('reports.summarizeFindings')}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">{t('reports.recommendations')}</Label>
            <Textarea
              id="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder={t('reports.provideRecommendations')}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">{t('reports.priority')}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as ReportPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">{t('reports.low')}</SelectItem>
                  <SelectItem value="Medium">{t('reports.medium')}</SelectItem>
                  <SelectItem value="High">{t('reports.high')}</SelectItem>
                  <SelectItem value="Critical">{t('reports.critical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('reports.status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as ReportStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">{t('reports.draft')}</SelectItem>
                  <SelectItem value="Under Review">{t('reports.underReview')}</SelectItem>
                  <SelectItem value="Completed">{t('reports.completed')}</SelectItem>
                  <SelectItem value="Archived">{t('reports.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? t('reports.creating') : t('reports.create')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateReportForm;