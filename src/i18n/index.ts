import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locale files
import enCommon from './locales/en/common.json';
import enPages from './locales/en/pages.json';
import enForms from './locales/en/forms.json';

import ruCommon from './locales/ru/common.json';
import ruPages from './locales/ru/pages.json';
import ruForms from './locales/ru/forms.json';

import uzCommon from './locales/uz/common.json';
import uzPages from './locales/uz/pages.json';
import uzForms from './locales/uz/forms.json';

const resources = {
  en: {
    common: enCommon,
    pages: enPages,
    forms: enForms
  },
  ru: {
    common: ruCommon,
    pages: ruPages,
    forms: ruForms
  },
  uz: {
    common: uzCommon,
    pages: uzPages,
    forms: uzForms
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false
    },

    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${lng}:${ns}:${key}`);
      }
    }
  });

// Update HTML lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;