import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { t } from "@/lib/translations";

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "la", name: "Latin" },
  { code: "hi", name: "हिन्दी" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "ml", name: "മലയാളം" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "bn", name: "বাংলা" },
  { code: "ur", name: "اردو" },
  { code: "ar", name: "العربية" },
  { code: "fa", name: "فارسی" },
  { code: "tr", name: "Türkçe" },
  { code: "ru", name: "Русский" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "th", name: "ไทย" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "ms", name: "Bahasa Melayu" },
  { code: "tl", name: "Filipino" },
  { code: "sw", name: "Kiswahili" },
  { code: "nl", name: "Nederlands" },
  { code: "pl", name: "Polski" },
  { code: "el", name: "Ελληνικά" },
];

type LangCtx = { lang: string; setLang: (c: string) => void; translate: (key: string, fallback?: string) => string };
const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {}, translate: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(() => localStorage.getItem("gyd_lang") || "en");
  useEffect(() => { localStorage.setItem("gyd_lang", lang); }, [lang]);

  const setLang = useCallback((c: string) => { setLangState(c); }, []);

  const translate = useCallback((key: string, fallback?: string): string => {
    return t(key, lang) ?? fallback ?? key;
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang, translate }}>{children}</Ctx.Provider>;
}

export const useLanguage = () => useContext(Ctx);
