import { Globe } from 'lucide-react';
import { useLanguageStore } from '../../../stores/languageStore';
import { t } from '../../../lib/i18n';
import type { Language } from '../../../lib/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();

  const toggleLanguage = () => {
    const newLang: Language = language === 'en' ? 'fa' : 'en';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 rounded-full p-2 text-primary hover:bg-black/5 transition-colors"
      aria-label={t('common.language', language)}
      title={language === 'en' ? 'تغییر به فارسی' : 'Switch to English'}
    >
      <Globe className="h-5 w-5" />
      <span className="text-xs font-medium">
        {language === 'en' ? 'FA' : 'EN'}
      </span>
    </button>
  );
}
