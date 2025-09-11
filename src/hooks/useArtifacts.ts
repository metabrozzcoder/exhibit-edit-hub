import { useState, useEffect } from 'react';
import { Artifact } from '@/types/artifact';
import { mockArtifacts } from '@/data/mockArtifacts';

export const useArtifacts = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load artifacts from localStorage or use mock data
    const savedArtifacts = localStorage.getItem('artifacts');
    if (savedArtifacts) {
      try {
        setArtifacts(JSON.parse(savedArtifacts));
      } catch (error) {
        console.error('Error loading artifacts from localStorage:', error);
        setArtifacts(mockArtifacts);
      }
    } else {
      setArtifacts(mockArtifacts);
    }
    setIsLoading(false);
  }, []);

  const saveToStorage = (updatedArtifacts: Artifact[]) => {
    try {
      localStorage.setItem('artifacts', JSON.stringify(updatedArtifacts));
    } catch (error) {
      console.error('Error saving artifacts to localStorage:', error);
    }
  };

  const addArtifact = (artifactData: Partial<Artifact>) => {
    const newArtifact: Artifact = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user@museum.org', // This should come from auth
      lastEditedBy: 'current-user@museum.org',
      ...artifactData
    } as Artifact;

    const updatedArtifacts = [...artifacts, newArtifact];
    setArtifacts(updatedArtifacts);
    saveToStorage(updatedArtifacts);
    return newArtifact;
  };

  const updateArtifact = (artifactId: string, updates: Partial<Artifact>) => {
    const updatedArtifacts = artifacts.map(artifact =>
      artifact.id === artifactId
        ? {
            ...artifact,
            ...updates,
            updatedAt: new Date().toISOString(),
            lastEditedBy: 'current-user@museum.org' // This should come from auth
          }
        : artifact
    );

    setArtifacts(updatedArtifacts);
    saveToStorage(updatedArtifacts);
  };

  const deleteArtifact = (artifactId: string) => {
    const updatedArtifacts = artifacts.filter(artifact => artifact.id !== artifactId);
    setArtifacts(updatedArtifacts);
    saveToStorage(updatedArtifacts);
  };

  const searchArtifacts = (searchTerm: string) => {
    if (!searchTerm.trim()) return artifacts;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return artifacts.filter(artifact =>
      artifact.title.toLowerCase().includes(lowerSearchTerm) ||
      artifact.accessionNumber.toLowerCase().includes(lowerSearchTerm) ||
      artifact.description.toLowerCase().includes(lowerSearchTerm) ||
      artifact.culture.toLowerCase().includes(lowerSearchTerm) ||
      artifact.category.toLowerCase().includes(lowerSearchTerm) ||
      artifact.period.toLowerCase().includes(lowerSearchTerm) ||
      artifact.material.toLowerCase().includes(lowerSearchTerm) ||
      artifact.location.toLowerCase().includes(lowerSearchTerm) ||
      artifact.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
      artifact.provenance?.toLowerCase().includes(lowerSearchTerm) ||
      artifact.conservationNotes?.toLowerCase().includes(lowerSearchTerm)
    );
  };

  const filterArtifacts = (filters: {
    searchTerm?: string;
    category?: string;
    condition?: string;
    location?: string;
    tags?: string[];
  }) => {
    let filtered = artifacts;

    if (filters.searchTerm) {
      filtered = searchArtifacts(filters.searchTerm);
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(artifact => artifact.category === filters.category);
    }

    if (filters.condition && filters.condition !== 'all') {
      filtered = filtered.filter(artifact => artifact.condition === filters.condition);
    }

    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(artifact => artifact.location === filters.location);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(artifact => 
        filters.tags!.some(tag => 
          artifact.tags.some(artifactTag => 
            artifactTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    return filtered;
  };

  const getCategories = () => {
    return Array.from(new Set(artifacts.map(a => a.category)));
  };

  const getConditions = () => {
    return Array.from(new Set(artifacts.map(a => a.condition)));
  };

  const getLocations = () => {
    return Array.from(new Set(artifacts.map(a => a.location)));
  };

  const getAllTags = () => {
    const allTags = artifacts.flatMap(artifact => artifact.tags);
    return Array.from(new Set(allTags)).sort();
  };

  return {
    artifacts,
    isLoading,
    addArtifact,
    updateArtifact,
    deleteArtifact,
    searchArtifacts,
    filterArtifacts,
    getCategories,
    getConditions,
    getLocations,
    getAllTags,
  };
};