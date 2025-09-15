import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import CreateReportForm from '@/components/reports/CreateReportForm';
import ReportsList from '@/components/reports/ReportsList';
import { FileText, Plus, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReportsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['reports', 'common']);
  const [activeTab, setActiveTab] = useState('list');

  // Check if user has permission to view reports (not viewers)
  if (user?.role === 'viewer') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-semibold">{t('reports:accessRestricted')}</h2>
          <p className="text-muted-foreground max-w-md">
            {t('reports:noPermission')}
          </p>
        </div>
      </div>
    );
  }

  const handleReportCreated = () => {
    setActiveTab('list');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('reports:title')}</h1>
          <p className="text-muted-foreground">
            {t('reports:description')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            {t('reports:viewReports')}
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('reports:createReport')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <ReportsList />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <CreateReportForm onReportCreated={handleReportCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;