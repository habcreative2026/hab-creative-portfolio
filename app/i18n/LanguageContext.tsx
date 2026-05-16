"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { translations } from "./translations";

type Lang = "vi" | "en" | "de";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof translations.vi;
};

const LanguageContext =
  createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved =
      localStorage.getItem("lang") as Lang;

    if (saved) {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}