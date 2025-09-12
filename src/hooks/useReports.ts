import { useState, useEffect } from 'react';
import { Report, ReportType, ReportPriority, ReportStatus } from '@/types/report';
import { Artifact } from '@/types/artifact';

const mockReports: Report[] = [
  {
    id: '1',
    artifactId: 'art-001',
    artifactTitle: 'Ancient Greek Amphora',
    reportType: 'Conservation',
    title: 'Conservation Assessment - Crack Repair',
    content: 'Detailed analysis of structural integrity and repair recommendations for the amphora crack discovered during routine inspection.',
    findings: 'Small hairline crack detected on the neck area, approximately 2cm in length.',
    recommendations: 'Immediate stabilization required. Professional conservation treatment recommended within 30 days.',
    priority: 'High',
    status: 'Completed',
    createdBy: 'Dr. Sarah Johnson',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
    reviewedBy: 'Prof. Michael Chen',
    reviewedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    artifactId: 'art-002',
    artifactTitle: 'Roman Bronze Coin',
    reportType: 'Research',
    title: 'Provenance Research Report',
    content: 'Comprehensive research into the historical background and authenticity verification of the Roman bronze coin.',
    findings: 'Coin dates to Emperor Trajan period (98-117 AD). Authentication confirmed through metallurgical analysis.',
    recommendations: 'Suitable for exhibition. Recommend climate-controlled display case.',
    priority: 'Medium',
    status: 'Under Review',
    createdBy: 'Dr. Emily Rodriguez',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  }
];

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load reports from localStorage or use mock data
    const savedReports = localStorage.getItem('museum_reports');
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports));
      } catch (error) {
        console.error('Error loading reports from localStorage:', error);
        setReports(mockReports);
        localStorage.setItem('museum_reports', JSON.stringify(mockReports));
      }
    } else {
      setReports(mockReports);
      localStorage.setItem('museum_reports', JSON.stringify(mockReports));
    }
    setIsLoading(false);
  }, []);

  const saveToStorage = (updatedReports: Report[]) => {
    localStorage.setItem('museum_reports', JSON.stringify(updatedReports));
  };

  const createReport = (reportData: Partial<Report>) => {
    const newReport: Report = {
      id: `report-${Date.now()}`,
      artifactId: reportData.artifactId || '',
      artifactTitle: reportData.artifactTitle || '',
      reportType: reportData.reportType || 'General',
      title: reportData.title || '',
      content: reportData.content || '',
      findings: reportData.findings || '',
      recommendations: reportData.recommendations || '',
      priority: reportData.priority || 'Medium',
      status: reportData.status || 'Draft',
      attachments: reportData.attachments || [],
      createdBy: reportData.createdBy || 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewedBy: reportData.reviewedBy,
      reviewedAt: reportData.reviewedAt
    };

    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    saveToStorage(updatedReports);
    return newReport;
  };

  const updateReport = (reportId: string, updates: Partial<Report>) => {
    const updatedReports = reports.map(report =>
      report.id === reportId
        ? { ...report, ...updates, updatedAt: new Date().toISOString() }
        : report
    );
    setReports(updatedReports);
    saveToStorage(updatedReports);
  };

  const deleteReport = (reportId: string) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    setReports(updatedReports);
    saveToStorage(updatedReports);
  };

  const getReportsByArtifact = (artifactId: string) => {
    return reports.filter(report => report.artifactId === artifactId);
  };

  const getReportsByType = (reportType: ReportType) => {
    return reports.filter(report => report.reportType === reportType);
  };

  const getReportsByStatus = (status: ReportStatus) => {
    return reports.filter(report => report.status === status);
  };

  const getReportsByPriority = (priority: ReportPriority) => {
    return reports.filter(report => report.priority === priority);
  };

  const searchReports = (searchTerm: string) => {
    if (!searchTerm.trim()) return reports;
    
    const term = searchTerm.toLowerCase();
    return reports.filter(report =>
      report.title.toLowerCase().includes(term) ||
      report.content.toLowerCase().includes(term) ||
      report.artifactTitle.toLowerCase().includes(term) ||
      report.reportType.toLowerCase().includes(term) ||
      report.createdBy.toLowerCase().includes(term)
    );
  };

  return {
    reports,
    isLoading,
    createReport,
    updateReport,
    deleteReport,
    getReportsByArtifact,
    getReportsByType,
    getReportsByStatus,
    getReportsByPriority,
    searchReports
  };
};