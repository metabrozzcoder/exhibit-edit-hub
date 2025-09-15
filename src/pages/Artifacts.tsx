import { useState } from 'react';
import { Plus, Filter, Download, Grid, List, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import ArtifactCard from '@/components/artifacts/ArtifactCard';
import AddArtifactForm from '@/components/artifacts/AddArtifactForm';
import ArtifactDetailsDialog from '@/components/artifacts/ArtifactDetailsDialog';
import { useArtifacts } from '@/hooks/useArtifacts';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Artifact } from '@/types/artifact';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/common/PageHeader';
import { usePageTitle } from '@/hooks/usePageTitle';

const Artifacts = () => {
  usePageTitle('artifacts');
  const { permissions } = useAuth();
  const { notifyArtifactAdded, notifyArtifactUpdated, notifyArtifactDeleted } = useNotifications();
  const { t } = useTranslation(['artifacts', 'common']);
  const { 
    artifacts, 
    filterArtifacts, 
    getCategories, 
    getConditions, 
    addArtifact, 
    updateArtifact, 
    deleteArtifact 
  } = useArtifacts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [viewingArtifact, setViewingArtifact] = useState<Artifact | null>(null);
  
  const filteredArtifacts = filterArtifacts({
    searchTerm,
    category: selectedCategory,
    condition: selectedCondition,
  });

  const categories = getCategories();
  const conditions = getConditions();

  const handleAdd = () => {
    setShowAddForm(true);
    setEditingArtifact(null);
  };

  const handleEdit = (artifact: Artifact) => {
    setEditingArtifact(artifact);
    setShowAddForm(true);
  };

  const handleDelete = (artifactId: string) => {
    const artifact = artifacts.find(a => a.id === artifactId);
    if (confirm(t('artifacts:deleteConfirm'))) {
      deleteArtifact(artifactId);
      if (artifact) {
        notifyArtifactDeleted(artifact.title, artifact.accessionNumber);
      }
      toast({
        title: t('artifacts:deleteSuccess'),
        description: t('artifacts:deleteSuccessDesc'),
      });
    }
  };

  const handleView = (artifact: Artifact) => {
    setViewingArtifact(artifact);
  };

  const handleSave = (artifactData: Partial<Artifact>) => {
    if (editingArtifact) {
      // Update existing artifact
      updateArtifact(editingArtifact.id, artifactData);
      notifyArtifactUpdated(artifactData.title || editingArtifact.title, artifactData.accessionNumber || editingArtifact.accessionNumber);
      toast({
        title: t('artifacts:artifactUpdated'),
        description: t('artifacts:artifactUpdatedDesc'),
      });
    } else {
      // Add new artifact
      addArtifact(artifactData);
      notifyArtifactAdded(artifactData.title || 'New Artifact', artifactData.accessionNumber || 'Unknown');
      toast({
        title: t('artifacts:artifactCreated'),
        description: t('artifacts:artifactCreatedDesc'),
      });
    }
    setShowAddForm(false);
    setEditingArtifact(null);
  };

  const handleExport = () => {
    // Convert to CSV format
    const csvHeaders = ['Accession Number', 'Title', 'Category', 'Period', 'Culture', 'Condition', 'Location'];
    const csvData = filteredArtifacts.map(artifact => [
      artifact.accessionNumber,
      artifact.title,
      artifact.category,
      artifact.period,
      artifact.culture,
      artifact.condition,
      artifact.location
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artifacts-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: t('artifacts:exportCompleted'),
      description: t('artifacts:exportDesc', { count: filteredArtifacts.length }),
    });
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) + 
    (selectedCondition !== 'all' ? 1 : 0) + 
    (searchTerm ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader pageKey="artifacts" />
        <div>
          <p className="text-muted-foreground">
            {t('pages:artifacts.manageCollection', { shown: filteredArtifacts.length, total: artifacts.length })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {permissions?.canExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t('common:export')}
            </Button>
          )}
          {permissions?.canCreate && (
            <Button 
              className="bg-museum-gold hover:bg-museum-gold/90 text-museum-gold-foreground"
              onClick={handleAdd}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('artifacts:addArtifact')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('artifacts:searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('artifacts:category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('artifacts:allCategories')}</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {t(`artifacts:${category.toLowerCase().replace(/\s+/g, '')}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedCondition} onValueChange={setSelectedCondition}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('artifacts:condition')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('artifacts:allConditions')}</SelectItem>
              {conditions.map(condition => (
                <SelectItem key={condition} value={condition}>
                  {t(`artifacts:${condition.toLowerCase()}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            {t('artifacts:filters')}
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredArtifacts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('artifacts:noArtifactsFound')}</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' || selectedCondition !== 'all'
              ? t('artifacts:adjustFilters')
              : t('artifacts:getStarted')
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-4'
        }>
          {filteredArtifacts.map((artifact) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}
      
      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <AddArtifactForm
          mode={editingArtifact ? 'edit' : 'create'}
          initialData={editingArtifact || undefined}
          onSave={handleSave}
          onClose={() => {
            setShowAddForm(false);
            setEditingArtifact(null);
          }}
        />
      )}

      <ArtifactDetailsDialog
        open={!!viewingArtifact}
        artifact={viewingArtifact}
        onClose={() => setViewingArtifact(null)}
        onEdit={(artifact) => {
          setViewingArtifact(null);
          setEditingArtifact(artifact);
          setShowAddForm(true);
        }}
      />
    </div>
  );
};

export default Artifacts;