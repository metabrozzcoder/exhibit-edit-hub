-- Create storage buckets for artifact images
INSERT INTO storage.buckets (id, name, public) VALUES ('artifact-images', 'artifact-images', true);

-- Create RLS policies for artifact images bucket
CREATE POLICY "Anyone can view artifact images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'artifact-images');

CREATE POLICY "Authenticated users can upload artifact images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'artifact-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update artifact images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'artifact-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete artifact images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'artifact-images' AND auth.uid() IS NOT NULL);