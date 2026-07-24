import { useEffect } from 'react';

const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script';

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
  useEffect(() => {
    if (document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) return;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en', // Set your site's default language
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    const script = document.createElement('script');
    script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []); // Empty dependency array ensures this runs only once

  return <div id="google_translate_element" className="flex items-center"></div>;
}