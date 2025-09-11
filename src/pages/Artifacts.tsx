import { useState } from 'react';
import { Plus, Filter, Download, Grid, List, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ArtifactCard from '@/components/artifacts/ArtifactCard';
import { mockArtifacts } from '@/data/mockArtifacts';
import { useAuth } from '@/hooks/useAuth';
import { Artifact } from '@/types/artifact';

const Artifacts = () => {
  const { permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const filteredArtifacts = mockArtifacts.filter(artifact => {
    const matchesSearch = artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artifact.accessionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artifact.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || artifact.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || artifact.condition === selectedCondition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const categories = Array.from(new Set(mockArtifacts.map(a => a.category)));
  const conditions = Array.from(new Set(mockArtifacts.map(a => a.condition)));

  const handleEdit = (artifact: Artifact) => {
    console.log('Edit artifact:', artifact.id);
    // Navigate to edit form
  };

  const handleDelete = (artifactId: string) => {
    console.log('Delete artifact:', artifactId);
    // Implement delete functionality with Firebase
  };

  const handleView = (artifact: Artifact) => {
    console.log('View artifact:', artifact.id);
    // Navigate to detail view
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) + 
    (selectedCondition !== 'all' ? 1 : 0) + 
    (searchTerm ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-museum-bronze">Artifacts</h1>
          <p className="text-muted-foreground">
            Manage your museum collection ({filteredArtifacts.length} of {mockArtifacts.length} shown)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {permissions?.canExport && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {permissions?.canCreate && (
            <Button className="bg-museum-gold hover:bg-museum-gold/90 text-museum-gold-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Add Artifact
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search artifacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedCondition} onValueChange={setSelectedCondition}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {conditions.map(condition => (
                <SelectItem key={condition} value={condition}>
                  {condition}
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
            Filters
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
          <h3 className="text-lg font-semibold mb-2">No artifacts found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' || selectedCondition !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first artifact'
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
    </div>
  );
};

export default Artifacts;