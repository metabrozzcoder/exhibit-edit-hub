import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Artifact } from '@/types/artifact';
import { useRealtime } from './useRealtime';

export const useArtifacts = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArtifacts();
  }, []);

  // Set up real-time synchronization
  useRealtime(
    'artifacts',
    () => fetchArtifacts(), // on insert
    () => fetchArtifacts(), // on update
    () => fetchArtifacts()  // on delete
  );

  const fetchArtifacts = async () => {
    try {
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedArtifacts: Artifact[] = data.map(item => ({
        id: item.id,
        accessionNumber: item.accession_number,
        title: item.title,
        description: item.description,
        category: item.category,
        period: item.period,
        culture: item.culture,
        material: item.material,
        dimensions: {
          height: item.height || 0,
          width: item.width || 0,
          depth: item.depth || 0,
          weight: item.weight || 0,
        },
        condition: item.condition as Artifact['condition'],
        location: item.location as Artifact['location'],
        imageUrl: item.image_url || '',
        vitrineImageUrl: item.vitrine_image_url || '',
        provenance: item.provenance,
        acquisitionDate: item.acquisition_date,
        acquisitionMethod: item.acquisition_method as Artifact['acquisitionMethod'],
        estimatedValue: item.estimated_value,
        exhibitionHistory: item.exhibition_history || [],
        conservationNotes: item.conservation_notes || '',
        tags: item.tags || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        createdBy: item.created_by,
        lastEditedBy: item.last_edited_by,
      }));

      setArtifacts(formattedArtifacts);
    } catch (error) {
      console.error('Error fetching artifacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addArtifact = async (artifactData: Partial<Artifact>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('artifacts')
        .insert({
          accession_number: artifactData.accessionNumber!,
          title: artifactData.title!,
          description: artifactData.description!,
          category: artifactData.category!,
          period: artifactData.period!,
          culture: artifactData.culture!,
          material: artifactData.material!,
          height: artifactData.dimensions?.height,
          width: artifactData.dimensions?.width,
          depth: artifactData.dimensions?.depth,
          weight: artifactData.dimensions?.weight,
          condition: artifactData.condition!,
          location: artifactData.location!,
          image_url: artifactData.imageUrl,
          vitrine_image_url: artifactData.vitrineImageUrl,
          provenance: artifactData.provenance!,
          acquisition_date: artifactData.acquisitionDate!,
          acquisition_method: artifactData.acquisitionMethod!,
          estimated_value: artifactData.estimatedValue,
          exhibition_history: artifactData.exhibitionHistory || [],
          conservation_notes: artifactData.conservationNotes || '',
          tags: artifactData.tags || [],
          created_by: user.id,
          last_edited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchArtifacts();
      return data;
    } catch (error) {
      console.error('Error adding artifact:', error);
      throw error;
    }
  };

  const updateArtifact = async (artifactId: string, updates: Partial<Artifact>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {
        last_edited_by: user.id,
      };

      // Map Artifact fields to database fields
      if (updates.accessionNumber) updateData.accession_number = updates.accessionNumber;
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.category) updateData.category = updates.category;
      if (updates.period) updateData.period = updates.period;
      if (updates.culture) updateData.culture = updates.culture;
      if (updates.material) updateData.material = updates.material;
      if (updates.dimensions?.height !== undefined) updateData.height = updates.dimensions.height;
      if (updates.dimensions?.width !== undefined) updateData.width = updates.dimensions.width;
      if (updates.dimensions?.depth !== undefined) updateData.depth = updates.dimensions.depth;
      if (updates.dimensions?.weight !== undefined) updateData.weight = updates.dimensions.weight;
      if (updates.condition) updateData.condition = updates.condition;
      if (updates.location) updateData.location = updates.location;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.vitrineImageUrl !== undefined) updateData.vitrine_image_url = updates.vitrineImageUrl;
      if (updates.provenance) updateData.provenance = updates.provenance;
      if (updates.acquisitionDate) updateData.acquisition_date = updates.acquisitionDate;
      if (updates.acquisitionMethod) updateData.acquisition_method = updates.acquisitionMethod;
      if (updates.estimatedValue !== undefined) updateData.estimated_value = updates.estimatedValue;
      if (updates.exhibitionHistory) updateData.exhibition_history = updates.exhibitionHistory;
      if (updates.conservationNotes !== undefined) updateData.conservation_notes = updates.conservationNotes;
      if (updates.tags) updateData.tags = updates.tags;

      const { error } = await supabase
        .from('artifacts')
        .update(updateData)
        .eq('id', artifactId);

      if (error) throw error;
      await fetchArtifacts();
    } catch (error) {
      console.error('Error updating artifact:', error);
      throw error;
    }
  };

  const deleteArtifact = async (artifactId: string) => {
    try {
      const { error } = await supabase
        .from('artifacts')
        .delete()
        .eq('id', artifactId);

      if (error) throw error;
      await fetchArtifacts();
    } catch (error) {
      console.error('Error deleting artifact:', error);
      throw error;
    }
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
    refetch: fetchArtifacts,
  };
};