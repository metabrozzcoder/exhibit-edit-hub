import { useState } from 'react';
import { Search, MapPin, Building, Users, FileText, Settings, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const quickSearches = [
    { label: 'Ancient Greek artifacts', icon: Building },
    { label: 'Items in vitrine', icon: MapPin },
    { label: 'Damaged condition', icon: FileText },
    { label: 'Recent acquisitions', icon: UserPlus },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-museum-bronze">Search</h1>
        <p className="text-muted-foreground">
          Find artifacts across your collection
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, accession number, description, culture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
      </div>

      {searchTerm && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Search functionality will be connected to your Firebase database.
                Current search term: "{searchTerm}"
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchPage;