import { useEffect, useState, useRef } from "react";
import { LANGUAGES, useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";

const GOOGLE_TRANSLATE_SCRIPT_ID = "google-translate-script";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: {
          new (
            options: {
              pageLanguage: string;
              layout?: any;
              autoDisplay?: boolean;
              includedLanguages?: string;
            },
            elementId: string
          ): void;
          InlineLayout: {
            SIMPLE: any;
          };
        };
      };
    };
  }
}

export default function GoogleTranslate() {
  const { lang, setLang } = useLanguage();
  const [showPopup, setShowPopup] = useState(false);
  const popupShown = useRef(false);

  useEffect(() => {
    // Inject CSS to clean up Google Translate top frame and banners
    const styleId = "google-translate-custom-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .goog-te-banner-frame { display: none !important; }
        .goog-te-balloon-frame { display: none !important; }
        body { top: 0px !important; position: static !important; }
        #google_translate_element select { display: none !important; }
        .goog-te-gadget { font-size: 0px !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      window.googleTranslateElementInit = () => {
        if (window.google?.translate?.TranslateElement) {
          const codes = LANGUAGES.map((l) => l.code).join(",");
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: true,
              includedLanguages: codes,
            },
            "google_translate_element"
          );

          // Apply selected language after widget init
          if (lang && lang !== "en") {
            setTimeout(() => {
              const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
              if (select) {
                select.value = lang;
                select.dispatchEvent(new Event("change"));
              }
            }, 500);
          }
        }
      };

      const script = document.createElement("script");
      script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [lang]);

  useEffect(() => {
    if (popupShown.current) return;
    popupShown.current = true;

    const savedLang = localStorage.getItem("app_lang");
    if (savedLang) return;

    const browserLang = navigator.language?.split("-")[0] || "en";
    const isSupported = LANGUAGES.some((l) => l.code === browserLang);

    if (browserLang !== "en" && isSupported) {
      const timer = setTimeout(() => setShowPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [setLang]);

  const handleTranslate = (targetLang: string) => {
    setShowPopup(false);
    setLang(targetLang);
  };

  return (
    <>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />

      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-popover border rounded-xl shadow-xl p-6 max-w-md mx-4 text-center relative">
            <h3 className="font-display font-bold text-xl text-gradient mb-3">
              Translate This Page?
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              We detected your browser is set to a different language. Would you like to translate this page?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => handleTranslate(navigator.language?.split("-")[0] || "en")}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-smooth text-sm"
              >
                Yes, Translate
              </button>
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="px-5 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-smooth text-sm"
              >
                No, keep English
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-smooth"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
