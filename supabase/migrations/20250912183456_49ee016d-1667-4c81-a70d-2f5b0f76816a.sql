-- Fix security warnings by setting search_path for functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;