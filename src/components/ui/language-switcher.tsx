import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

const LanguageSwitcher = () => {
  const { changeLanguage, currentLanguage } = useLanguage();
  const { t } = useTranslation(['common']);

  const languages = [
    { code: 'en', name: t('common:language.english'), flag: '🇺🇸' },
    { code: 'ru', name: t('common:language.russian'), flag: '🇷🇺' },
    { code: 'uz', name: t('common:language.uzbek'), flag: '🇺🇿' }
  ];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      await changeLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-popover border">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="gap-2"
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;