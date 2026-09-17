import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'fa',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'vyro_language',
    }
  )
);
