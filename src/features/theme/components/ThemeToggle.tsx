import { Sun, Moon } from 'lucide-react';
import { useThemeStore, getResolvedTheme } from '../../../stores/themeStore';
import { useLanguageStore } from '../../../stores/languageStore';
import { t } from '../../../lib/i18n';
import { cn } from '../../../lib/utils';

interface ThemeToggleProps {
  className?: string;
  onClick?: () => void;
}

export function ThemeToggle({ className, onClick }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const language = useLanguageStore((state) => state.language);
  const resolved = getResolvedTheme(theme);
  const isDark = resolved === 'dark';

  const title = isDark ? t('common.lightMode', language) : t('common.darkMode', language);

  const handleClick = () => {
    toggleTheme();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      aria-label={t('common.theme', language)}
      title={title}
    >
      <span className="sr-only">{title}</span>
      {isDark ? (
        <Sun size={20} className="transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon size={20} className="transition-transform duration-300 rotate-0 scale-100" />
      )}
    </button>
  );
}
