import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserSettings {
  id?: string;
  userId: string;
  emailNotifications: boolean;
  autoSave: boolean;
  advancedFeatures: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: boolean;
  auditLogging: boolean;
  themePreference: string;
  languagePreference: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const formattedSettings: UserSettings = {
          id: data.id,
          userId: data.user_id,
          emailNotifications: data.email_notifications,
          autoSave: data.auto_save,
          advancedFeatures: data.advanced_features,
          twoFactorEnabled: data.two_factor_enabled,
          sessionTimeout: data.session_timeout,
          auditLogging: data.audit_logging,
          themePreference: data.theme_preference,
          languagePreference: data.language_preference,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setSettings(formattedSettings);
      } else {
        // Create default settings if none exist
        const defaultSettings: UserSettings = {
          userId: user.id,
          emailNotifications: true,
          autoSave: true,
          advancedFeatures: false,
          twoFactorEnabled: false,
          sessionTimeout: true,
          auditLogging: true,
          themePreference: 'museum',
          languagePreference: 'en',
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: Partial<UserSettings>) => {
    if (!user || !settings) return;

    try {
      const settingsData = {
        user_id: user.id,
        email_notifications: updatedSettings.emailNotifications ?? settings.emailNotifications,
        auto_save: updatedSettings.autoSave ?? settings.autoSave,
        advanced_features: updatedSettings.advancedFeatures ?? settings.advancedFeatures,
        two_factor_enabled: updatedSettings.twoFactorEnabled ?? settings.twoFactorEnabled,
        session_timeout: updatedSettings.sessionTimeout ?? settings.sessionTimeout,
        audit_logging: updatedSettings.auditLogging ?? settings.auditLogging,
        theme_preference: updatedSettings.themePreference ?? settings.themePreference,
        language_preference: updatedSettings.languagePreference ?? settings.languagePreference,
      };

      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('user_settings')
          .insert(settingsData)
          .select()
          .single();

        if (error) throw error;
        
        const formattedSettings: UserSettings = {
          id: data.id,
          userId: data.user_id,
          emailNotifications: data.email_notifications,
          autoSave: data.auto_save,
          advancedFeatures: data.advanced_features,
          twoFactorEnabled: data.two_factor_enabled,
          sessionTimeout: data.session_timeout,
          auditLogging: data.audit_logging,
          themePreference: data.theme_preference,
          languagePreference: data.language_preference,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setSettings(formattedSettings);
        return;
      }

      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  return {
    settings,
    isLoading,
    saveSettings,
    refetch: fetchSettings,
  };
};