import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from 'react';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (value: string) => {
    // Update i18n instance language
    i18n.changeLanguage(value);
    // Save the language preference to localStorage
    localStorage.setItem('i18nextLng', value);
    // Force a reload to ensure all components update with the new language
    // This is more reliable than trying to update every component manually
    window.location.reload();
  };
  
  useEffect(() => {
    // Get the language from localStorage or use default
    const savedLanguage = localStorage.getItem('i18nextLng')?.split('-')[0] || 'en';
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);
  
  return (
    <Select
      value={i18n.language?.split('-')[0] || 'en'}
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