import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import pt from './locales/pt';

// Get saved language or default to English
const savedLanguage = localStorage.getItem('i18nextLng');
const supportedLanguages = ['en', 'es', 'fr', 'de', 'pt'];
const initialLanguage = savedLanguage && supportedLanguages.includes(savedLanguage.split('-')[0]) 
  ? savedLanguage.split('-')[0] 
  : 'en';

// Initialize i18next
i18n
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Detect user language
  .use(LanguageDetector)
  // Initialize configuration
  .init({
    debug: false, // Set to false in production
    fallbackLng: 'en',
    lng: initialLanguage, // Force the initial language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      en,
      es,
      fr,
      de,
      pt,
    },
    // Set detection order to prioritize localStorage
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    }
  });

// Force the language to be set
if (initialLanguage) {
  console.log(`Setting initial language to: ${initialLanguage}`);
  i18n.changeLanguage(initialLanguage);
}

export default i18n;