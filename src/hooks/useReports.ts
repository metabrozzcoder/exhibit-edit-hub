import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportType, ReportPriority, ReportStatus } from '@/types/report';
import { useRealtime } from './useRealtime';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  // Set up real-time synchronization
  useRealtime(
    'reports',
    () => fetchReports(), // on insert
    () => fetchReports(), // on update
    () => fetchReports()  // on delete
  );

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReports: Report[] = data.map(item => ({
        id: item.id,
        artifactId: item.artifact_id,
        artifactTitle: item.artifact_title,
        reportType: item.report_type as ReportType,
        title: item.title,
        content: item.content,
        findings: item.findings,
        recommendations: item.recommendations,
        priority: item.priority as ReportPriority,
        status: item.status as ReportStatus,
        attachments: item.attachments || [],
        createdBy: item.created_by,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        reviewedBy: item.reviewed_by,
        reviewedAt: item.reviewed_at,
      }));

      setReports(formattedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createReport = async (reportData: Partial<Report>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reports')
        .insert({
          artifact_id: reportData.artifactId!,
          artifact_title: reportData.artifactTitle!,
          report_type: reportData.reportType!,
          title: reportData.title!,
          content: reportData.content!,
          findings: reportData.findings,
          recommendations: reportData.recommendations,
          priority: reportData.priority!,
          status: reportData.status!,
          attachments: reportData.attachments || [],
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchReports();
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  };

  const updateReport = async (reportId: string, updates: Partial<Report>) => {
    try {
      const updateData: any = {};

      // Map Report fields to database fields
      if (updates.artifactId) updateData.artifact_id = updates.artifactId;
      if (updates.artifactTitle) updateData.artifact_title = updates.artifactTitle;
      if (updates.reportType) updateData.report_type = updates.reportType;
      if (updates.title) updateData.title = updates.title;
      if (updates.content) updateData.content = updates.content;
      if (updates.findings !== undefined) updateData.findings = updates.findings;
      if (updates.recommendations !== undefined) updateData.recommendations = updates.recommendations;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.status) updateData.status = updates.status;
      if (updates.attachments) updateData.attachments = updates.attachments;
      if (updates.reviewedBy !== undefined) updateData.reviewed_by = updates.reviewedBy;
      if (updates.reviewedAt !== undefined) updateData.reviewed_at = updates.reviewedAt;

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;
      await fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      await fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
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
    searchReports,
    refetch: fetchReports,
  };
};