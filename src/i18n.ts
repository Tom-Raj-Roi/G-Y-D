import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: [
      "en", "es", "fr", "de", "it", "pt", "la", "hi", "ta", "te",
      "ml", "kn", "bn", "ur", "ar", "fa", "tr", "ru", "zh", "ja",
      "ko", "th", "vi", "id", "ms", "tl", "sw", "nl", "pl", "el",
    ],
    fallbackLng: "en",
    debug: true,
    detection: {
      order: ["querystring", "cookie", "localStorage", "sessionStorage", "navigator", "htmlTag"],
      caches: ["cookie", "localStorage"],
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
