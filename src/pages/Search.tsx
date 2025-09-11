import { useState } from 'react';
import { Search, MapPin, Building, Users, FileText, Settings, UserPlus, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ArtifactCard from '@/components/artifacts/ArtifactCard';
import { useArtifacts } from '@/hooks/useArtifacts';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Artifact } from '@/types/artifact';

const SearchPage = () => {
  const { searchArtifacts, filterArtifacts, getCategories, getConditions, getLocations, updateArtifact, deleteArtifact } = useArtifacts();
  const { permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  
  const quickSearches = [
    { label: 'Ancient Greek artifacts', icon: Building },
    { label: 'Items in vitrine', icon: MapPin },
    { label: 'Damaged condition', icon: FileText },
    { label: 'Recent acquisitions', icon: UserPlus },
  ];

  const searchResults = filterArtifacts({
    searchTerm,
    category: selectedCategory,
    condition: selectedCondition,
    location: selectedLocation,
  });

  const categories = getCategories();
  const conditions = getConditions();
  const locations = getLocations();

  const handleEdit = (artifact: Artifact) => {
    // For now, just show a toast. This could be expanded to open an edit modal
    toast({
      title: "Edit functionality",
      description: `Edit form for ${artifact.title} would open here.`,
    });
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
    toast({
      title: "Artifact details",
      description: `Viewing ${artifact.title} (${artifact.accessionNumber})`,
    });
  };

  const hasFilters = searchTerm || selectedCategory !== 'all' || selectedCondition !== 'all' || selectedLocation !== 'all';

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
                  onClick={() => setSearchTerm(search.label)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {search.label}
                </Button>
              );
            })}
          </div>
          
          <div className="flex flex-col gap-2 min-w-48">
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
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search Results ({searchResults.length} found)
            </h2>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedCondition('all');
                setSelectedLocation('all');
              }}
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