import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Tag, Package } from 'lucide-react';
import { Artifact } from '@/types/artifact';
import { useAuth } from '@/hooks/useAuth';

interface ArtifactDetailsDialogProps {
  open: boolean;
  artifact: Artifact | null;
  onClose: () => void;
  onEdit?: (artifact: Artifact) => void;
}

const ArtifactDetailsDialog = ({ open, artifact, onClose, onEdit }: ArtifactDetailsDialogProps) => {
  const { permissions } = useAuth();

  if (!artifact) return null;

  const dimensions = artifact.dimensions;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between gap-4">
            <span className="flex-1">{artifact.title}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {artifact.accessionNumber}
              </Badge>
              <Badge>{artifact.condition}</Badge>
              {artifact.location === 'vitrine' && (
                <Badge className="bg-museum-gold text-museum-gold-foreground">In Vitrine</Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            Quick view of artifact details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-video bg-muted rounded overflow-hidden relative">
              {artifact.imageUrl ? (
                <img
                  src={artifact.imageUrl}
                  alt={`Photo of ${artifact.title} (Accession ${artifact.accessionNumber})`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="h-12 w-12" />
                </div>
              )}
            </div>
            
            {artifact.vitrineImageUrl && (
              <div className="aspect-video bg-muted rounded overflow-hidden relative">
                <img
                  src={artifact.vitrineImageUrl}
                  alt={`Vitrine photo of ${artifact.title}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">Vitrine</Badge>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{artifact.description}</p>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {artifact.period}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> 
                  <span className="capitalize">{artifact.location}</span>
                  {artifact.conservationNotes && artifact.conservationNotes.includes('Location:') && (
                    <span className="text-xs ml-1 text-muted-foreground">
                      ({artifact.conservationNotes.split('Location:')[1]?.split('\n')[0]?.trim()})
                    </span>
                  )}
                </span>
              </div>

              {artifact.tags?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {artifact.tags.slice(0, 6).map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                  {artifact.tags.length > 6 && (
                    <Badge variant="outline">+{artifact.tags.length - 6}</Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">Category</span>
                <span>{artifact.category}</span>
                <span className="text-muted-foreground">Culture</span>
                <span>{artifact.culture}</span>
                <span className="text-muted-foreground">Material</span>
                <span>{artifact.material}</span>
                <span className="text-muted-foreground">Dimensions</span>
                <span>
                  H {dimensions.height} × W {dimensions.width} × D {dimensions.depth}
                  {dimensions.weight ? ` • ${dimensions.weight} kg` : ''}
                </span>
                <span className="text-muted-foreground">Provenance</span>
                <span>{artifact.provenance}</span>
                <span className="text-muted-foreground">Acquisition</span>
                <span>{artifact.acquisitionMethod} · {artifact.acquisitionDate}</span>
                {artifact.estimatedValue && (
                  <>
                    <span className="text-muted-foreground">Estimated Value</span>
                    <span>${artifact.estimatedValue.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {artifact.conservationNotes && (
            <div className="space-y-2">
              <Separator />
              <div>
                <h4 className="text-sm font-medium">Conservation Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{artifact.conservationNotes}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Last updated {new Date(artifact.updatedAt).toLocaleString()}</span>
          <div className="flex gap-2">
            {permissions?.canEdit && onEdit && (
              <Button variant="secondary" onClick={() => onEdit(artifact)}>Edit</Button>
            )}
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArtifactDetailsDialog;
