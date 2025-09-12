import { useState } from 'react';
import { Search, MapPin, Building, Users, FileText, Settings, UserPlus, Package, Tag, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ArtifactCard from '@/components/artifacts/ArtifactCard';
import AddArtifactForm from '@/components/artifacts/AddArtifactForm';
import ArtifactDetailsDialog from '@/components/artifacts/ArtifactDetailsDialog';
import { useArtifacts } from '@/hooks/useArtifacts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Artifact } from '@/types/artifact';

const SearchPage = () => {
  const { searchArtifacts, filterArtifacts, getCategories, getConditions, getLocations, getAllTags, updateArtifact, deleteArtifact } = useArtifacts();
  const { permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null);
  const [viewingArtifact, setViewingArtifact] = useState<Artifact | null>(null);
  
  const quickSearches = [
    { 
      label: 'Ancient Greek', 
      icon: Building, 
      action: () => {
        setSearchTerm('Ancient Greek');
        setShowFilters(true);
      }
    },
    { 
      label: 'In Vitrine', 
      icon: MapPin, 
      action: () => {
        setSelectedLocation('vitrine');
        setShowFilters(true);
      }
    },
    { 
      label: 'In Warehouse', 
      icon: Package, 
      action: () => {
        setSelectedLocation('warehouse');
        setShowFilters(true);
      }
    },
    { 
      label: 'Classical Art', 
      icon: Tag, 
      action: () => {
        setSelectedTags(prev => prev.includes('Classical') ? prev : [...prev, 'Classical']);
        setShowFilters(true);
      }
    },
  ];

  const searchResults = filterArtifacts({
    searchTerm,
    category: selectedCategory,
    condition: selectedCondition,
    location: selectedLocation,
    tags: selectedTags,
  });

  const categories = getCategories();
  const conditions = getConditions();
  const locations = getLocations();
  const allTags = getAllTags();

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSelectedLocation('all');
    setSelectedTags([]);
  };

  const handleEdit = (artifact: Artifact) => {
    setEditingArtifact(artifact);
    setShowAddForm(true);
  };

  const handleDelete = (artifactId: string) => {
    if (confirm('Are you sure you want to delete this artifact? This action cannot be undone.')) {
      deleteArtifact(artifactId);
      toast({
        title: "Artifact deleted",
        description: "The artifact has been successfully removed from the collection.",
      });
    }
  };

  const handleView = (artifact: Artifact) => {
    setViewingArtifact(artifact);
  };

  const hasFilters = searchTerm || selectedCategory !== 'all' || selectedCondition !== 'all' || selectedLocation !== 'all' || selectedTags.length > 0;
  const activeFiltersCount = 
    (searchTerm ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) + 
    (selectedCondition !== 'all' ? 1 : 0) + 
    (selectedLocation !== 'all' ? 1 : 0) +
    selectedTags.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-museum-bronze">Search</h1>
        <p className="text-muted-foreground">
          Find artifacts across your collection
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, accession number, description, culture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-lg"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="grid grid-cols-2 gap-4 flex-1">
            {quickSearches.map((search) => {
              const Icon = search.icon;
              return (
                <Button
                  key={search.label}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={search.action}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {search.label}
                </Button>
              );
            })}
          </div>
          
          <div className="flex flex-col gap-2 min-w-64">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="justify-between"
            >
              <span className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Filters
              </span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            <Collapsible open={showFilters} onOpenChange={setShowFilters}>
              <CollapsibleContent className="space-y-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        <span className="capitalize">{location}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tags Section */}
                <div className="border rounded-lg p-3">
                  <Label className="text-sm font-medium mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Tags
                  </Label>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {allTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <Label 
                          htmlFor={`tag-${tag}`} 
                          className="text-sm cursor-pointer"
                        >
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchTerm}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
              </Badge>
            )}
            {selectedCondition !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Condition: {selectedCondition}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCondition('all')} />
              </Badge>
            )}
            {selectedLocation !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Location: {selectedLocation}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLocation('all')} />
              </Badge>
            )}
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                Tag: {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagToggle(tag)} />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {showAddForm && (
        <AddArtifactForm
          mode={editingArtifact ? 'edit' : 'create'}
          initialData={editingArtifact || undefined}
          onSave={(artifactData) => {
            if (editingArtifact) {
              updateArtifact(editingArtifact.id, artifactData);
              toast({
                title: 'Artifact updated',
                description: 'The artifact has been successfully updated.',
              });
            }
            setShowAddForm(false);
            setEditingArtifact(null);
          }}
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

      {hasFilters && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search Results ({searchResults.length} found)
            </h2>
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
            >
              Clear Filters
            </Button>
          </div>
          
          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No artifacts found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((artifact) => (
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
      )}
    </div>
  );
};

export default SearchPage;