import { useTranslation } from 'react-i18next';
import { useSettings } from './useSettings';
import { useEffect } from 'react';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { settings, saveSettings } = useSettings();

  useEffect(() => {
    if (settings?.languagePreference && i18n.language !== settings.languagePreference) {
      i18n.changeLanguage(settings.languagePreference);
    }
  }, [settings?.languagePreference, i18n]);

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      if (settings) {
        await saveSettings({ languagePreference: language });
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    isLoading: !settings
  };
};