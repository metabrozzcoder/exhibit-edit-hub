-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'curator', 'researcher', 'viewer')),
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create artifacts table
CREATE TABLE public.artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  accession_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  period TEXT NOT NULL,
  culture TEXT NOT NULL,
  material TEXT NOT NULL,
  height DECIMAL,
  width DECIMAL,
  depth DECIMAL,
  weight DECIMAL,
  condition TEXT NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'Damaged')),
  location TEXT NOT NULL CHECK (location IN ('vitrine', 'warehouse')),
  image_url TEXT,
  vitrine_image_url TEXT,
  provenance TEXT NOT NULL,
  acquisition_date DATE NOT NULL,
  acquisition_method TEXT NOT NULL CHECK (acquisition_method IN ('Purchase', 'Donation', 'Loan', 'Bequest', 'Transfer')),
  estimated_value DECIMAL,
  exhibition_history TEXT[],
  conservation_notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  last_edited_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artifact_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  artifact_title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('Conservation', 'Condition Assessment', 'Research', 'Acquisition', 'Exhibition', 'General')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  findings TEXT,
  recommendations TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Under Review', 'Completed', 'Archived')),
  attachments TEXT[],
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create artifact history table
CREATE TABLE public.artifact_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artifact_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  changes JSONB NOT NULL DEFAULT '{}',
  edited_by UUID NOT NULL REFERENCES auth.users(id),
  edited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.artifact_history ENABLE ROW LEVEL SECURITY;

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artifacts_updated_at
  BEFORE UPDATE ON public.artifacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log artifact changes
CREATE OR REPLACE FUNCTION public.log_artifact_changes()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB := '{}';
  old_record RECORD;
  new_record RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.artifact_history (artifact_id, action, changes, edited_by, notes)
    VALUES (NEW.id, 'created', '{}', NEW.created_by, 'Artifact created');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Build changes JSON by comparing OLD and NEW
    IF OLD.title != NEW.title THEN
      changes_json := changes_json || jsonb_build_object('title', jsonb_build_object('old', OLD.title, 'new', NEW.title));
    END IF;
    IF OLD.condition != NEW.condition THEN
      changes_json := changes_json || jsonb_build_object('condition', jsonb_build_object('old', OLD.condition, 'new', NEW.condition));
    END IF;
    IF OLD.location != NEW.location THEN
      changes_json := changes_json || jsonb_build_object('location', jsonb_build_object('old', OLD.location, 'new', NEW.location));
    END IF;
    IF OLD.conservation_notes != NEW.conservation_notes THEN
      changes_json := changes_json || jsonb_build_object('conservation_notes', jsonb_build_object('old', OLD.conservation_notes, 'new', NEW.conservation_notes));
    END IF;
    
    INSERT INTO public.artifact_history (artifact_id, action, changes, edited_by, notes)
    VALUES (NEW.id, 'updated', changes_json, NEW.last_edited_by, 'Artifact updated');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.artifact_history (artifact_id, action, changes, edited_by, notes)
    VALUES (OLD.id, 'deleted', '{}', auth.uid(), 'Artifact deleted');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for artifact history logging
CREATE TRIGGER log_artifact_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.artifacts
  FOR EACH ROW EXECUTE FUNCTION public.log_artifact_changes();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for artifacts
CREATE POLICY "Anyone can view artifacts" ON public.artifacts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create artifacts" ON public.artifacts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update artifacts" ON public.artifacts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and curators can delete artifacts" ON public.artifacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'curator')
    )
  );

-- RLS Policies for reports
CREATE POLICY "Anyone can view reports" ON public.reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reports" ON public.reports
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can update any reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own reports" ON public.reports
  FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for artifact history
CREATE POLICY "Anyone can view artifact history" ON public.artifact_history
  FOR SELECT USING (true);

CREATE POLICY "System can insert history records" ON public.artifact_history
  FOR INSERT WITH CHECK (true);