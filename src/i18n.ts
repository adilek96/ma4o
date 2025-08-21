import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "../translation/en";
import { ru } from "../translation/ru";



const savedLng = (() => {
  try {
    // Проверяем язык из Telegram, если приложение запущено в Telegram
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const initData = tg.initData;
      if (initData) {
        try {
          const urlParams = new URLSearchParams(initData);
          const userParam = urlParams.get("user");
          if (userParam) {
            const userData = JSON.parse(userParam);
            const userLanguage = userData.language_code;
            if (userLanguage && (userLanguage === "ru" || userLanguage === "en")) {
              return userLanguage;
            }
          }
        } catch (error) {
          console.error("Ошибка при парсинге языка из Telegram:", error);
        }
      }
    }
    
    // Fallback на сохраненный язык
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

// Функция для изменения языка с сохранением в localStorage
export const changeLanguage = (language: string) => {
  try {
    localStorage.setItem("lng", language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.error("Ошибка при изменении языка:", error);
  }
};