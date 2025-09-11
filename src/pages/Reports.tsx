import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, BarChart3, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ReportsPage = () => {
  const reports = [
    {
      title: 'Collection Summary',
      description: 'Overview of all artifacts by category, condition, and location',
      icon: BarChart3,
      action: () => generateReport('collection-summary'),
    },
    {
      title: 'Acquisition Report',
      description: 'Details of recent acquisitions and their sources',
      icon: TrendingUp,
      action: () => generateReport('acquisitions'),
    },
    {
      title: 'Conservation Status',
      description: 'Artifacts requiring conservation work or attention',
      icon: FileText,
      action: () => generateReport('conservation'),
    },
    {
      title: 'Exhibition History',
      description: 'Track which artifacts have been displayed and when',
      icon: Download,
      action: () => generateReport('exhibitions'),
    },
  ];

  const generateReport = (type: string) => {
    // Mock report generation
    toast({
      title: "Report generated",
      description: `${type} report has been prepared and downloaded.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-museum-bronze">Reports</h1>
        <p className="text-muted-foreground">
          Generate detailed reports about your collection
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-museum-gold" />
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{report.description}</p>
                <Button 
                  onClick={report.action}
                  className="w-full bg-museum-gold hover:bg-museum-gold/90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsPage;