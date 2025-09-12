export interface Report {
  id: string;
  artifactId: string;
  artifactTitle: string;
  reportType: 'Conservation' | 'Condition Assessment' | 'Research' | 'Acquisition' | 'Exhibition' | 'General';
  title: string;
  content: string;
  findings?: string;
  recommendations?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Under Review' | 'Completed' | 'Archived';
  attachments?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type ReportType = 'Conservation' | 'Condition Assessment' | 'Research' | 'Acquisition' | 'Exhibition' | 'General';
export type ReportPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReportStatus = 'Draft' | 'Under Review' | 'Completed' | 'Archived';