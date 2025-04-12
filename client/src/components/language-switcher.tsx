import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from 'react';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language?.split('-')[0] || 'en');
  
  const changeLanguage = (value: string) => {
    // Update state
    setCurrentLang(value);
    
    // Update i18n instance language
    i18n.changeLanguage(value);
    
    // Save the language preference to localStorage with the exact code
    localStorage.setItem('i18nextLng', value);
    
    // Force a reload to ensure all components update with the new language
    // This is more reliable than trying to update every component manually
    window.location.reload();
  };
  
  useEffect(() => {
    // Get the language from localStorage or use default
    const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
    
    // Make sure we're using a supported language code
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'pt'];
    const language = supportedLanguages.includes(savedLanguage.split('-')[0]) 
      ? savedLanguage.split('-')[0] 
      : 'en';
    
    // Update the current language state
    setCurrentLang(language);
    
    // Only change if different - this prevents infinite loops
    if (i18n.language !== language) {
      console.log(`Changing language from ${i18n.language} to ${language}`);
      i18n.changeLanguage(language);
    }
  }, [i18n]);
  
  return (
    <Select
      value={currentLang}
      onValueChange={changeLanguage}
    >
      <SelectTrigger id="language-select" className="w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="es">Español</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="de">Deutsch</SelectItem>
        <SelectItem value="pt">Português</SelectItem>
      </SelectContent>
    </Select>
  );
}