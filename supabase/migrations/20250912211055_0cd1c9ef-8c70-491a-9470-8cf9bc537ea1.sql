-- Add admin delete policy for reports
CREATE POLICY "Admins can delete any reports" 
ON public.reports 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);