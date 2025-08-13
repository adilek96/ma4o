import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "../translation/en";
import { ru } from "../translation/ru";



const savedLng = (() => {
  try {
    return localStorage.getItem("lng") || undefined;
  } catch {
    return undefined;
  }
})();

i18n
  .use(initReactI18next) 
  .init({
    resources: {
      en: {
        translation: en
      },
      ru: {
        translation: ru
      }
    },
    lng: savedLng || "en", 
    fallbackLng: "en",

    interpolation: {
      escapeValue: false 
    }
  });

  export default i18n;