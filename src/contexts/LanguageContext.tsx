import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from "react";

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

type LangCtx = { 
  lang: string; 
  setLang: (c: string) => void; 
  translate: (key: string, fallback?: string) => string; 
};

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  translate: (_key, fallback) => fallback || _key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_lang");
      if (saved) return saved;
      
      const match = document.cookie.match(/(?:^|;) *googtrans=([^;]+)/);
      if (match) {
        const parts = match[1].split("/");
        const target = parts[parts.length - 1];
        if (target && LANGUAGES.some((l) => l.code === target)) {
          return target;
        }
      }
    }
    return "en";
  });

  const setGoogTransCookie = (code: string) => {
    const hostname = window.location.hostname;
    if (code === "en") {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname}`;
    } else {
      const value = `/en/${code}`;
      document.cookie = `googtrans=${value}; path=/;`;
      document.cookie = `googtrans=${value}; path=/; domain=${hostname}`;
    }
  };

  const triggerGoogleTranslateSelect = (code: string) => {
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
    }
  };

  const setLang = useCallback((code: string) => {
    setLangState(code);
    localStorage.setItem("app_lang", code);
    setGoogTransCookie(code);
    triggerGoogleTranslateSelect(code);
  }, []);

  useEffect(() => {
    if (lang !== "en") {
      setGoogTransCookie(lang);
    }
  }, [lang]);

  const translate = useCallback((_key: string, fallback?: string) => {
    return fallback || _key;
  }, []);

  return (
    <Ctx.Provider value={{ lang, setLang, translate }}>
      {children}
    </Ctx.Provider>
  );
}

export const useLanguage = () => useContext(Ctx);
