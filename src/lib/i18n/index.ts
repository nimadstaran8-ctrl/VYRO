import { fa } from './fa';
import { en } from './en';

export type Language = 'fa' | 'en';

const translations: Record<Language, typeof fa> = { fa, en };

export function t(key: string, lang: Language = 'en'): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export function getDirection(lang: Language): 'rtl' | 'ltr' {
  return lang === 'fa' ? 'rtl' : 'ltr';
}

export { fa, en };
