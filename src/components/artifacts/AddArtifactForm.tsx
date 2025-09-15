import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Upload, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Artifact } from '@/types/artifact';
import { supabase } from '@/integrations/supabase/client';

const optionalPositiveNumber = z
  .preprocess((val) => {
    if (val === '' || val === null || (typeof val === 'string' && val.trim() === '')) return undefined;
    return typeof val === 'string' ? Number(val) : val;
  }, z.number().positive('Must be greater than 0'))
  .optional();

const artifactSchema = z.object({
  accessionNumber: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  customCategory: z.string().optional(),
  period: z.string().optional(),
  culture: z.string().optional(),
  material: z.string().optional(),
  height: optionalPositiveNumber,
  width: optionalPositiveNumber,
  depth: optionalPositiveNumber,
  weight: optionalPositiveNumber,
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Damaged']).optional(),
  location: z.enum(['warehouse', 'vitrine', 'custom']).optional(),
  locationCustomName: z.string().optional(),
  provenance: z.string().optional(),
  acquisitionDate: z.string().optional(),
  acquisitionMethod: z.enum(['Purchase', 'Donation', 'Loan', 'Bequest', 'Transfer']).optional(),
  donorName: z.string().optional(),
  estimatedValue: optionalPositiveNumber,
  conservationNotes: z.string().optional(),
  tags: z.string().optional(),
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
  const { t } = useTranslation(['artifacts', 'common', 'forms']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');
  const [vitrineImageFile, setVitrineImageFile] = useState<File | null>(null);
  const [vitrineImagePreview, setVitrineImagePreview] = useState<string>(initialData?.vitrineImageUrl || '');
  const [locationImageFile, setLocationImageFile] = useState<File | null>(null);
  const [locationImagePreview, setLocationImagePreview] = useState<string>('');
  const [showCustomCategory, setShowCustomCategory] = useState<boolean>(false);

  const form = useForm<ArtifactFormData>({
    resolver: zodResolver(artifactSchema),
    defaultValues: {
      accessionNumber: initialData?.accessionNumber || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      customCategory: '',
      period: initialData?.period || '',
      culture: initialData?.culture || '',
      material: initialData?.material || '',
      height: initialData?.dimensions?.height,
      width: initialData?.dimensions?.width,
      depth: initialData?.dimensions?.depth,
      weight: initialData?.dimensions?.weight,
      condition: initialData?.condition || 'Good',
      location: initialData?.location || 'warehouse',
      locationCustomName: '',
      provenance: initialData?.provenance || '',
      acquisitionDate: initialData?.acquisitionDate?.split('T')[0] || '',
      acquisitionMethod: initialData?.acquisitionMethod || 'Purchase',
      donorName: '',
      estimatedValue: initialData?.estimatedValue,
      conservationNotes: initialData?.conservationNotes || '',
      tags: initialData?.tags?.join(', ') || '',
      vitrineImageUrl: initialData?.vitrineImageUrl || '',
    },
  });


  const handleLocationImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocationImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLocationImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVitrineImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVitrineImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setVitrineImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToStorage = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artifact-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artifact-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const onSubmit = async (data: ArtifactFormData) => {
    const finalCategory = data.category === 'Custom' ? data.customCategory : data.category;
    
    // Upload images to Supabase Storage
    let imageUrl = '';
    let vitrineImageUrl = '';
    
    if (imageFile) {
      const uploadedImageUrl = await uploadImageToStorage(imageFile, 'artifacts');
      if (uploadedImageUrl) imageUrl = uploadedImageUrl;
    }
    
    if (vitrineImageFile) {
      const uploadedVitrineUrl = await uploadImageToStorage(vitrineImageFile, 'vitrines');
      if (uploadedVitrineUrl) vitrineImageUrl = uploadedVitrineUrl;
    }

    const artifact: Partial<Artifact> = {
      accessionNumber: data.accessionNumber,
      title: data.title,
      description: data.description,
      category: finalCategory || data.category,
      period: data.period,
      culture: data.culture,
      material: data.material,
      dimensions: {
        height: data.height,
        width: data.width,
        depth: data.depth || 0,
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
      imageUrl: imageUrl || imagePreview,
      vitrineImageUrl: vitrineImageUrl || vitrineImagePreview || undefined,
      exhibitionHistory: [],
    };

    // Add donor information for donations
    if (data.acquisitionMethod === 'Donation' && data.donorName) {
      artifact.provenance = `${artifact.provenance} - Donated by: ${data.donorName}`;
    }

    // Add location custom name
    if (data.locationCustomName) {
      artifact.conservationNotes = `${artifact.conservationNotes}\nLocation: ${data.locationCustomName}`.trim();
    }

    // For edit mode, include the existing artifact data
    if (mode === 'edit' && initialData) {
      artifact.id = initialData.id;
      artifact.createdAt = initialData.createdAt;
      artifact.createdBy = initialData.createdBy;
    }

    onSave(artifact);
  };

  const categories = ['Ceramics', 'Stone Objects', 'Glass', 'Metalwork', 'Textiles', 'Paintings', 'Sculptures', 'Custom'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];
  const acquisitionMethods = ['Purchase', 'Donation', 'Loan', 'Bequest', 'Transfer'];
  const locations = ['warehouse', 'vitrine', 'custom'];

  const selectedLocation = form.watch('location');
  const selectedCategory = form.watch('category');
  const selectedAcquisitionMethod = form.watch('acquisitionMethod');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl">
            {mode === 'create' ? t('addArtifact') : t('common:edit')}
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
                  <h3 className="text-lg font-medium">{t('forms:labels.basicInformation')}</h3>
                  
                  <FormField
                    control={form.control}
                    name="accessionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:fields.accessionNumber')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('forms:placeholders.accessionNumber')} {...field} />
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
                        <FormLabel>{t('forms:fields.title')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('forms:placeholders.artifactTitle')} {...field} />
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
                        <FormLabel>{t('forms:fields.description')}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('forms:placeholders.description')} 
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
                          <FormLabel>{t('forms:fields.category')}</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setShowCustomCategory(value === 'Custom');
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('forms:placeholders.selectCategory')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {t(`forms:categories.${category.toLowerCase().replace(/\s+/g, '')}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedCategory === 'Custom' && (
                      <FormField
                        control={form.control}
                        name="customCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('forms:labels.customCategory')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('forms:placeholders.customCategory')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('forms:fields.condition')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('forms:placeholders.selectCondition')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditions.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {t(`forms:conditions.${condition.toLowerCase()}`)}
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
                  <h3 className="text-lg font-medium">{t('forms:labels.culturalInformation')}</h3>
                  
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:fields.period')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('forms:placeholders.period')} {...field} />
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
                        <FormLabel>{t('forms:fields.culture')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('forms:placeholders.culture')} {...field} />
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
                        <FormLabel>{t('forms:fields.material')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('forms:placeholders.material')} {...field} />
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
                        <FormLabel>{t('forms:labels.currentLocation')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('forms:placeholders.selectLocation')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vitrine">{t('forms:labels.inVitrine')}</SelectItem>
                            <SelectItem value="warehouse">{t('forms:labels.inWarehouse')}</SelectItem>
                            <SelectItem value="custom">{t('forms:labels.customLocation')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedLocation === 'custom' && (
                    <FormField
                      control={form.control}
                      name="locationCustomName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('forms:labels.customLocation')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('forms:placeholders.customLocation')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="locationCustomName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:labels.locationDetails')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('forms:placeholders.locationDetails')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location Image Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('forms:labels.locationImage')}</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLocationImageChange}
                          className="hidden"
                          id="location-image-upload"
                        />
                        <label
                          htmlFor="location-image-upload"
                          className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent"
                        >
                          <Upload className="h-4 w-4" />
                          {locationImagePreview ? t('forms:buttons.replaceLocationImage') : t('forms:buttons.uploadLocationImage')}
                        </label>
                      </div>
                      {locationImagePreview && (
                        <div className="relative">
                          <img 
                            src={locationImagePreview} 
                            alt="Location preview" 
                            className="w-20 h-20 object-cover rounded-md border" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setLocationImageFile(null);
                              setLocationImagePreview('');
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{t('forms:labels.uploadLocationImage')}</p>
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('forms:labels.dimensions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:labels.height')}</FormLabel>
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
                        <FormLabel>{t('forms:labels.width')}</FormLabel>
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
                        <FormLabel>{t('forms:labels.depth')}</FormLabel>
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
                        <FormLabel>{t('forms:labels.weight')}</FormLabel>
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
                  <h3 className="text-lg font-medium">{t('forms:labels.acquisitionInformation')}</h3>
                  
                  <FormField
                    control={form.control}
                    name="provenance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:fields.provenance')}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('forms:placeholders.provenance')} 
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
                          <FormLabel>{t('forms:fields.acquisitionDate')}</FormLabel>
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
                          <FormLabel>{t('forms:fields.acquisitionMethod')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('forms:placeholders.selectAcquisitionMethod')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {acquisitionMethods.map((method) => (
                                <SelectItem key={method} value={method}>
                                  {t(`forms:acquisitionMethods.${method.toLowerCase()}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {selectedAcquisitionMethod === 'Donation' && (
                    <FormField
                      control={form.control}
                      name="donorName"
                      render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('forms:labels.donorName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('forms:placeholders.donorName')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                      )}
                    />
                  )}
                  
                  <div className="grid grid-cols-1 gap-4">
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="estimatedValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:labels.estimatedValue')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t('forms:placeholders.estimatedValue')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{t('forms:labels.imageUpload')}</h3>
                  
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
                            {t('forms:buttons.replaceImage')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                          <div>
                            <Button type="button" variant="outline" asChild>
                              <label htmlFor="image-upload" className="cursor-pointer">
                                {t('forms:buttons.uploadImage')}
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
                    <h3 className="text-lg font-medium">{t('forms:labels.vitrineImageUpload')}</h3>
                    
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
                            {t('forms:buttons.replaceVitrineImage')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                          <div>
                            <Button type="button" variant="outline" asChild>
                              <label htmlFor="vitrine-image-upload" className="cursor-pointer">
                                {t('forms:buttons.uploadVitrineImage')}
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
                <h3 className="text-lg font-medium">{t('forms:labels.additionalInformation')}</h3>
                
                <FormField
                  control={form.control}
                  name="conservationNotes"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:labels.conservationNotes')}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('forms:placeholders.conservationNotes')} 
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
                        <FormLabel>{t('forms:labels.tags')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('forms:placeholders.tags')} 
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
                  {t('forms:buttons.cancel')}
                </Button>
                <Button type="submit" className="bg-museum-gold hover:bg-museum-gold/90">
                  <Save className="h-4 w-4 mr-2" />
                  {t('forms:buttons.save')}
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