import { create } from 'zustand';

export type Language = 'vi' | 'en';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

// Load from localStorage on init
const getStoredLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('language-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.state?.language || 'vi';
      } catch {
        return 'vi';
      }
    }
  }
  return 'vi';
};

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: getStoredLanguage(),
  setLanguage: (lang: Language) => {
    set({ language: lang });
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language-storage', JSON.stringify({ state: { language: lang } }));
    }
  },
}));

