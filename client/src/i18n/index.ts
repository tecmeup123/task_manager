import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import en from './locales/en';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import pt from './locales/pt';
import zh from './locales/zh';

// Get saved language or default to English
const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
const supportedLanguages = ['en', 'es', 'fr', 'de', 'pt', 'zh'];
const simpleLang = savedLanguage.split('-')[0];
const initialLanguage = supportedLanguages.includes(simpleLang) ? simpleLang : 'en';

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
      zh,
    },
    // Set detection order to prioritize localStorage
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    },
    react: {
      useSuspense: false // Disable suspense for better compatibility
    }
  });

// Force the language to be set
console.log(`Setting initial language to: ${initialLanguage}`);
i18n.changeLanguage(initialLanguage);

// Update localStorage to ensure consistency
if (initialLanguage !== savedLanguage) {
  localStorage.setItem('i18nextLng', initialLanguage);
}

export default i18n;