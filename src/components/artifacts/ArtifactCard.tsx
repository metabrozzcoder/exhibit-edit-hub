import { Calendar, MapPin, Tag, Eye, Edit, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Artifact } from '@/types/artifact';
import { useAuth } from '@/hooks/useAuth';

interface ArtifactCardProps {
  artifact: Artifact;
  onEdit?: (artifact: Artifact) => void;
  onDelete?: (artifactId: string) => void;
  onView?: (artifact: Artifact) => void;
}

const ArtifactCard = ({ artifact, onEdit, onDelete, onView }: ArtifactCardProps) => {
  const { permissions } = useAuth();

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-orange-100 text-orange-800';
      case 'Damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {artifact.imageUrl ? (
            <img 
              src={artifact.imageUrl} 
              alt={artifact.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={getConditionColor(artifact.condition)}>
              {artifact.condition}
            </Badge>
          </div>
          {artifact.isOnDisplay && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-museum-gold text-museum-gold-foreground">
                On Display
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold line-clamp-1">{artifact.title}</h3>
            <p className="text-sm text-muted-foreground">{artifact.accessionNumber}</p>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {artifact.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {artifact.period}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {artifact.location}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {artifact.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {artifact.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{artifact.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView?.(artifact)}
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        
        <div className="flex gap-2">
          {permissions?.canEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit?.(artifact)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          {permissions?.canDelete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete?.(artifact.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ArtifactCard;