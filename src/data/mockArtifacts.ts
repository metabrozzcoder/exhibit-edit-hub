import { Artifact, ArtifactHistory } from '@/types/artifact';

export const mockArtifacts: Artifact[] = [
  {
    id: '1',
    accessionNumber: 'ANC.2023.001',
    title: 'Ancient Greek Amphora',
    description: 'A well-preserved red-figure amphora depicting scenes from Greek mythology, attributed to the workshop of the Achilles Painter, circa 450-440 BCE.',
    category: 'Ceramics',
    period: '5th century BCE',
    culture: 'Ancient Greek',
    material: 'Terracotta',
    dimensions: {
      height: 45.2,
      width: 28.5,
      depth: 28.5,
      weight: 3.2
    },
    condition: 'Good',
    location: 'Gallery A, Case 3',
    imageUrl: '',
    provenance: 'Private collection, acquired 1987; Sotheby\'s London, 2023',
    acquisitionDate: '2023-03-15',
    acquisitionMethod: 'Purchase',
    estimatedValue: 125000,
    exhibitionHistory: ['Greek Art Through the Ages (2023)', 'Myths in Clay (2024)'],
    conservationNotes: 'Minor restoration to base completed in 2023. Surface cleaning required annually.',
    tags: ['Greek', 'Classical', 'Mythology', 'Red-figure'],
    isOnDisplay: true,
    createdAt: '2023-03-15T10:00:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    createdBy: 'curator@museum.org',
    lastEditedBy: 'curator@museum.org'
  },
  {
    id: '2',
    accessionNumber: 'EGY.2024.005',
    title: 'Canopic Jar of Imsety',
    description: 'Limestone canopic jar with human-headed lid representing Imsety, guardian of the liver. Middle Kingdom period.',
    category: 'Stone Objects',
    period: 'Middle Kingdom (2055-1650 BCE)',
    culture: 'Ancient Egyptian',
    material: 'Limestone',
    dimensions: {
      height: 32.1,
      width: 15.8,
      depth: 15.8,
      weight: 2.8
    },
    condition: 'Excellent',
    location: 'Gallery B, Case 1',
    imageUrl: '',
    provenance: 'Excavated at Saqqara, 1982; Egyptian Museum loan, 2024',
    acquisitionDate: '2024-02-20',
    acquisitionMethod: 'Loan',
    estimatedValue: 85000,
    exhibitionHistory: ['Death and the Afterlife (2024)'],
    conservationNotes: 'Excellent condition. No conservation required.',
    tags: ['Egyptian', 'Funerary', 'Middle Kingdom', 'Stone'],
    isOnDisplay: true,
    createdAt: '2024-02-20T09:15:00Z',
    updatedAt: '2024-02-20T09:15:00Z',
    createdBy: 'curator@museum.org',
    lastEditedBy: 'curator@museum.org'
  },
  {
    id: '3',
    accessionNumber: 'ROM.2023.012',
    title: 'Roman Glass Unguentarium',
    description: 'Small blown glass vessel used for storing perfumes and oils. Characteristic teardrop shape of the 1st-2nd century CE.',
    category: 'Glass',
    period: '1st-2nd century CE',
    culture: 'Roman',
    material: 'Glass',
    dimensions: {
      height: 12.4,
      width: 4.2,
      depth: 4.2,
      weight: 0.08
    },
    condition: 'Fair',
    location: 'Storage Room C, Shelf 15',
    imageUrl: '',
    provenance: 'Private donation, estate of Dr. Margaret Thompson, 2023',
    acquisitionDate: '2023-09-10',
    acquisitionMethod: 'Donation',
    estimatedValue: 1200,
    exhibitionHistory: [],
    conservationNotes: 'Crack in neck requires stabilization before display. Handle with extreme care.',
    tags: ['Roman', 'Glass', 'Daily Life', 'Fragile'],
    isOnDisplay: false,
    createdAt: '2023-09-10T16:45:00Z',
    updatedAt: '2023-11-22T11:20:00Z',
    createdBy: 'researcher@museum.org',
    lastEditedBy: 'conservator@museum.org'
  }
];

export const mockHistory: ArtifactHistory[] = [
  {
    id: 'h1',
    artifactId: '1',
    action: 'updated',
    changes: {
      condition: { old: 'Excellent', new: 'Good' },
      conservationNotes: { 
        old: 'No issues noted.', 
        new: 'Minor restoration to base completed in 2023. Surface cleaning required annually.' 
      }
    },
    editedBy: 'curator@museum.org',
    editedAt: '2024-01-10T14:30:00Z',
    notes: 'Updated after conservation review'
  },
  {
    id: 'h2',
    artifactId: '3',
    action: 'updated',
    changes: {
      conservationNotes: { 
        old: 'Good condition.', 
        new: 'Crack in neck requires stabilization before display. Handle with extreme care.' 
      }
    },
    editedBy: 'conservator@museum.org',
    editedAt: '2023-11-22T11:20:00Z',
    notes: 'Condition assessment revealed structural weakness'
  },
  {
    id: 'h3',
    artifactId: '2',
    action: 'created',
    changes: {},
    editedBy: 'curator@museum.org',
    editedAt: '2024-02-20T09:15:00Z',
    notes: 'Initial catalog entry'
  }
];