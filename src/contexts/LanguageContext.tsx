import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "fr" | "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("fr");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem("language") as Language | null;
    if (savedLang && ["fr", "en", "es"].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    // Load translations for current language
    import(`@/translations/${language}.json`)
      .then((module) => {
        setTranslations(module.default);
      })
      .catch((error) => {
        console.error(`Failed to load translations for ${language}:`, error);
      });
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}