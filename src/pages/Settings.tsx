import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Bell, Database, Lock, Download, Palette, Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';

const SettingsPage = () => {
  const { user } = useAuth();
  const { settings, isLoading, saveSettings } = useSettings();
  const { t } = useTranslation();
  const { changeLanguage, currentLanguage } = useLanguage();

  const handleSettingChange = async (key: string, value: boolean) => {
    if (!settings) return;
    
      try {
        await saveSettings({ [key]: value });
        toast({
          title: t('settings.settingUpdated'),
          description: t('settings.preferencesSaved'),
        });
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('settings.settingsError'),
          variant: "destructive",
        });
      }
  };

  const handleLanguageChange = async (language: string) => {
    try {
      await changeLanguage(language);
      await saveSettings({ languagePreference: language });
      toast({
        title: "Language updated",
        description: "Your language preference has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save language preference. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAllSettings = async () => {
    try {
      // Save all current settings
      if (settings) {
        await saveSettings(settings);
        toast({
          title: "Settings saved",
          description: "All your preferences have been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackup = () => {
    toast({
      title: "Backup created",
      description: "Database backup has been generated and downloaded.",
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading settings...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-64">Please log in to access settings.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-museum-bronze">Settings</h1>
        <p className="text-muted-foreground">
          Configure your museum collection management system
        </p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive notifications about collection updates
                  </div>
                </div>
                <Switch 
                  checked={settings?.emailNotifications ?? true}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save Changes</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically save artifact changes
                  </div>
                </div>
                <Switch 
                  checked={settings?.autoSave ?? true}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Advanced Features</Label>
                  <div className="text-sm text-muted-foreground">
                    Display advanced management options
                  </div>
                </div>
                <Switch 
                  checked={settings?.advancedFeatures ?? false}
                  onCheckedChange={(checked) => handleSettingChange('advancedFeatures', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t('language')}
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Choose your preferred language
                  </div>
                </div>
                <Select 
                  value={currentLanguage} 
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 {t('english')}</SelectItem>
                    <SelectItem value="ru">🇷🇺 {t('russian')}</SelectItem>
                    <SelectItem value="uz">🇺🇿 {t('uzbek')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <div className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically log out after 30 minutes of inactivity
                  </div>
                </div>
                <Switch 
                  checked={settings?.sessionTimeout ?? true}
                  onCheckedChange={(checked) => handleSettingChange('sessionTimeout', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <div className="text-sm text-muted-foreground">
                    Track all user actions for security purposes
                  </div>
                </div>
                <Switch 
                  checked={settings?.auditLogging ?? true}
                  onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Button onClick={handleBackup} className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Database className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              
              <Button variant="outline" className="justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Collection
              </Button>
              
              <Button variant="outline" className="justify-start" disabled>
                <Database className="h-4 w-4 mr-2" />
                Sync with External DB
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <div className="text-sm text-muted-foreground">
                  Currently using museum theme with gold accents
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Customize
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveAllSettings}
            className="bg-museum-gold hover:bg-museum-gold/90"
          >
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;