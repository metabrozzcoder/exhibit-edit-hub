export interface Artifact {
  id: string;
  accessionNumber: string;
  title: string;
  description: string;
  category: string;
  period: string;
  culture: string;
  material: string;
  dimensions: {
    height: number;
    width: number;
    depth: number;
    weight?: number;
  };
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  location: 'vitrine' | 'warehouse';
  imageUrl?: string;
  vitrineImageUrl?: string;
  provenance: string;
  acquisitionDate: string;
  acquisitionMethod: 'Purchase' | 'Donation' | 'Loan' | 'Bequest' | 'Transfer';
  estimatedValue?: number;
  exhibitionHistory: string[];
  conservationNotes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastEditedBy: string;
}

export interface ArtifactHistory {
  id: string;
  artifactId: string;
  action: 'created' | 'updated' | 'deleted';
  changes: Record<string, { old: any; new: any }>;
  editedBy: string;
  editedAt: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'curator' | 'researcher' | 'viewer';
  department?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export type UserRole = 'admin' | 'curator' | 'researcher' | 'viewer';

export interface Permission {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageUsers: boolean;
}