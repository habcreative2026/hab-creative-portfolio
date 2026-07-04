"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Lang = "vi" | "en" | "de";

type TranslationDictionary = Record<string, string>;

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  loading: boolean;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [translations, setTranslations] = useState<
    Record<Lang, TranslationDictionary>
  >({
    vi: {},
    en: {},
    de: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang;
    if (saved) setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    async function loadCMSLanguages() {
      try {
        const res = await fetch(`${API_URL}/api/translations/public`, {
          next: { revalidate: 300 },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setTranslations(json.data);
          }
        }
      } catch (err) {
        console.error("Không thể đồng bộ ngôn ngữ từ CMS Backend:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCMSLanguages();
  }, []);

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, loading }}>
      {!loading ? (
        children
      ) : (
        <div className="fixed inset-0 bg-white flex items-center justify-center"></div>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
