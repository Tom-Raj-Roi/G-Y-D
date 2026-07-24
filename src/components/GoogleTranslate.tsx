import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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
              excludedLanguages?: string;
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

/**
 * GoogleTranslate
 *
 * Fixes the broken translation by:
 *  1. Loading the Google Translate Element widget (which provides
 *     automatic language detection + machine translation for every
 *     word on the page, including numbers and form fields).
 *  2. Auto-detecting the visitor's browser language and, when it
 *     differs from the page language, showing a one-time popup that
 *     offers to translate the page.
 *  3. Setting `autoDisplay: true` so that ALL text nodes — including
 *     form labels, placeholders, and numeric values — are translated.
 *  4. Integrating with the existing i18next LanguageContext so the
 *     language dropdown in the Header stays in sync.
 */
export default function GoogleTranslate() {
  const { lang, setLang } = useLanguage();
  const [showPopup, setShowPopup] = useState(false);
  const popupShown = useRef(false);

  // ── Load the Google Translate widget script ───────────────────────
  useEffect(() => {
    if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: true,
          includedLanguages: "en,es,fr,de,it,pt,la,hi,ta,te,ml,kn,bn,ur,ar,fa,tr,ru,zh,ja,ko,th,vi,id,ms,tl,sw,nl,pl,el",
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  // ── Auto-detect browser language & show popup on first visit ──────
  useEffect(() => {
    if (popupShown.current) return;
    popupShown.current = true;

    const savedLang = localStorage.getItem("i18nextLng");
    if (savedLang && savedLang !== "en") {
      setLang(savedLang);
      return;
    }

    const browserLang = navigator.language?.split("-")[0] || "en";
    const supported = [
      "en", "es", "fr", "de", "it", "pt", "la", "hi", "ta", "te",
      "ml", "kn", "bn", "ur", "ar", "fa", "tr", "ru", "zh", "ja",
      "ko", "th", "vi", "id", "ms", "tl", "sw", "nl", "pl", "el",
    ];

    if (browserLang !== "en" && supported.includes(browserLang)) {
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
      {/* This component now only manages the logic and the popup. The button is in the Header. */}

      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-popover border rounded-xl shadow-xl p-6 max-w-md mx-4 text-center">
            <h3 className="font-display font-bold text-xl text-gradient mb-3">
              Translate This Page?
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              We detected your browser is set to a different language.
              Would you like us to translate this page for you?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => handleTranslate(navigator.language?.split("-")[0] || "en")}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-smooth"
              >
                Yes, Translate
              </button>
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="px-5 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-smooth"
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
