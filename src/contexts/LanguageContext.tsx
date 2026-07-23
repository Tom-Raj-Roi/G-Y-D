import { createContext, useContext, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

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

type LangCtx = { lang: string; setLang: (c: string) => void; translate: TFunction; };
const Ctx = createContext<LangCtx>({} as LangCtx);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation();

  const setLang = useCallback((code: string) => {
    i18n.changeLanguage(code);
  }, [i18n]);

  const translate = useCallback((key: string, fallback?: string) => {
    return t(key, { defaultValue: fallback });
  }, [t]);

  return <Ctx.Provider value={{ lang: i18n.language, setLang, translate }}>{children}</Ctx.Provider>;
}

export const useLanguage = () => useContext(Ctx);
