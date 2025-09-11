import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Artifact } from '@/types/artifact';

const artifactSchema = z.object({
  accessionNumber: z.string().min(1, 'Accession number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  period: z.string().min(1, 'Period is required'),
  culture: z.string().min(1, 'Culture is required'),
  material: z.string().min(1, 'Material is required'),
  height: z.coerce.number().positive('Height must be positive'),
  width: z.coerce.number().positive('Width must be positive'),
  depth: z.coerce.number().positive('Depth must be positive'),
  weight: z.coerce.number().positive().optional(),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Damaged']),
  location: z.enum(['warehouse', 'vitrine']),
  provenance: z.string().min(1, 'Provenance is required'),
  acquisitionDate: z.string().min(1, 'Acquisition date is required'),
  acquisitionMethod: z.enum(['Purchase', 'Donation', 'Loan', 'Bequest', 'Transfer']),
  estimatedValue: z.coerce.number().positive().optional(),
  conservationNotes: z.string(),
  tags: z.string(),
  vitrineImageUrl: z.string().optional(),
});

type ArtifactFormData = z.infer<typeof artifactSchema>;

interface AddArtifactFormProps {
  onClose: () => void;
  onSave: (artifact: Partial<Artifact>) => void;
  initialData?: Partial<Artifact>;
  mode: 'create' | 'edit';
}

const AddArtifactForm = ({ onClose, onSave, initialData, mode }: AddArtifactFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');
  const [vitrineImageFile, setVitrineImageFile] = useState<File | null>(null);
  const [vitrineImagePreview, setVitrineImagePreview] = useState<string>(initialData?.vitrineImageUrl || '');

  const form = useForm<ArtifactFormData>({
    resolver: zodResolver(artifactSchema),
    defaultValues: {
      accessionNumber: initialData?.accessionNumber || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      period: initialData?.period || '',
      culture: initialData?.culture || '',
      material: initialData?.material || '',
      height: initialData?.dimensions?.height || 0,
      width: initialData?.dimensions?.width || 0,
      depth: initialData?.dimensions?.depth || 0,
      weight: initialData?.dimensions?.weight || undefined,
      condition: initialData?.condition || 'Good',
      location: initialData?.location || 'warehouse',
      provenance: initialData?.provenance || '',
      acquisitionDate: initialData?.acquisitionDate?.split('T')[0] || '',
      acquisitionMethod: initialData?.acquisitionMethod || 'Purchase',
      estimatedValue: initialData?.estimatedValue || undefined,
      conservationNotes: initialData?.conservationNotes || '',
      tags: initialData?.tags?.join(', ') || '',
      vitrineImageUrl: initialData?.vitrineImageUrl || '',
    },
  });

  const handleVitrineImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVitrineImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setVitrineImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ArtifactFormData) => {
    const artifact: Partial<Artifact> = {
      ...initialData,
      accessionNumber: data.accessionNumber,
      title: data.title,
      description: data.description,
      category: data.category,
      period: data.period,
      culture: data.culture,
      material: data.material,
      dimensions: {
        height: data.height,
        width: data.width,
        depth: data.depth,
        weight: data.weight,
      },
      condition: data.condition,
      location: data.location,
      provenance: data.provenance,
      acquisitionDate: data.acquisitionDate,
      acquisitionMethod: data.acquisitionMethod,
      estimatedValue: data.estimatedValue,
      conservationNotes: data.conservationNotes,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      imageUrl: imagePreview,
      vitrineImageUrl: vitrineImagePreview || undefined,
      updatedAt: new Date().toISOString(),
    };

    if (mode === 'create') {
      artifact.id = Date.now().toString();
      artifact.createdAt = new Date().toISOString();
      artifact.createdBy = 'curator@museum.org';
      artifact.lastEditedBy = 'curator@museum.org';
      artifact.exhibitionHistory = [];
    } else {
      artifact.lastEditedBy = 'curator@museum.org';
    }

    onSave(artifact);
  };

  const categories = ['Ceramics', 'Stone Objects', 'Glass', 'Metalwork', 'Textiles', 'Paintings', 'Sculptures'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];
  const acquisitionMethods = ['Purchase', 'Donation', 'Loan', 'Bequest', 'Transfer'];
  const locations = ['warehouse', 'vitrine'];

  const selectedLocation = form.watch('location');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl">
            {mode === 'create' ? 'Add New Artifact' : 'Edit Artifact'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="accessionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accession Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., ANC.2024.001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Artifact title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of the artifact" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditions.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {condition}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Cultural Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Cultural Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Period</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5th century BCE" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="culture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Culture</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Ancient Greek" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Terracotta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location.charAt(0).toUpperCase() + location.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vitrine">In Vitrine</SelectItem>
                            <SelectItem value="warehouse">In Warehouse</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dimensions (cm)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="depth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depth</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Acquisition Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Acquisition Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="provenance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provenance</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="History of ownership and acquisition" 
                            rows={2}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="acquisitionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Acquisition Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="acquisitionMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Acquisition Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {acquisitionMethods.map((method) => (
                                <SelectItem key={method} value={method}>
                                  {method}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="estimatedValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Value ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Image</h3>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-h-48 mx-auto rounded-lg object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setImagePreview('');
                              setImageFile(null);
                            }}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                          <div>
                            <Button type="button" variant="outline" asChild>
                              <label htmlFor="image-upload" className="cursor-pointer">
                                Upload Image
                              </label>
                            </Button>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, or GIF up to 10MB
                          </p>
                        </div>
                      )}
                </div>

                {/* Vitrine Image Upload - Only show if location is vitrine */}
                {selectedLocation === 'vitrine' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Vitrine Photo</h3>
                    
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      {vitrineImagePreview ? (
                        <div className="space-y-4">
                          <img 
                            src={vitrineImagePreview} 
                            alt="Vitrine Preview" 
                            className="max-h-48 mx-auto rounded-lg object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setVitrineImagePreview('');
                              setVitrineImageFile(null);
                            }}
                          >
                            Remove Vitrine Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                          <div>
                            <Button type="button" variant="outline" asChild>
                              <label htmlFor="vitrine-image-upload" className="cursor-pointer">
                                Upload Vitrine Photo
                              </label>
                            </Button>
                            <Input
                              id="vitrine-image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleVitrineImageChange}
                              className="hidden"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Photo of the display case/vitrine
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                
                <FormField
                  control={form.control}
                  name="conservationNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conservation Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any conservation work, condition notes, or care instructions" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Greek, Classical, Mythology, Red-figure (comma separated)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-museum-gold hover:bg-museum-gold/90">
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Create Artifact' : 'Update Artifact'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddArtifactForm;