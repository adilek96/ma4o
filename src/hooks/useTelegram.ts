import { useEffect, useState } from "react";
import { changeLanguage } from "../i18n";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface UseTelegramReturn {
  isTelegram: boolean;
  user: TelegramUser | null;
  theme: "light" | "dark" | null;
  initData: string | null;
  isLoading: boolean;
}

// Моковые данные для режима разработки
const mockUser: TelegramUser = {
  id: 123456789,
  first_name: "Тестовый",
  last_name: "Пользователь",
  username: "test_user",
  language_code: "ru",
  is_premium: false,
  photo_url: undefined,
};

export function useTelegram(): UseTelegramReturn {
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        // Проверяем, находимся ли мы в Telegram WebApp
        const isInTelegram = !!(window as any)?.Telegram?.WebApp;
        
        if (isInTelegram) {
          setIsTelegram(true);
          
          const tg = (window as any)?.Telegram?.WebApp;
          
          if (tg?.initData) {
            setInitData(tg.initData);
            
            // Парсим данные пользователя
            try {
              const urlParams = new URLSearchParams(tg.initData);
              const userParam = urlParams.get("user");
              
              if (userParam) {
                const userData: TelegramUser = JSON.parse(userParam);
                setUser(userData);
                
                // Устанавливаем язык пользователя
                if (userData.language_code) {
                  if (userData.language_code === "ru" || userData.language_code === "en") {
                    changeLanguage(userData.language_code);
                  } else {
                    changeLanguage("en");
                  }
                }
              }
            } catch (error) {
              console.error("Ошибка при парсинге данных пользователя:", error);
            }
          }
          
          // Получаем тему
          if (tg?.colorScheme) {
            setTheme(tg.colorScheme);
          }
          
          // Подписываемся на изменения темы
          if (tg?.onEvent) {
            const themeHandler = () => {
              if (tg.colorScheme) {
                setTheme(tg.colorScheme);
              }
            };
            
            tg.onEvent("themeChanged", themeHandler);
            
            // Очистка при размонтировании
            return () => {
              if (tg.offEvent) {
                tg.offEvent("themeChanged", themeHandler);
              }
            };
          }
        } else {
          // Не в Telegram WebApp - режим разработки
          console.log("Режим разработки: используем моковые данные");
          setUser(mockUser);
          setTheme("light"); // По умолчанию светлая тема в режиме разработки
          changeLanguage("ru"); // По умолчанию русский язык
        }
      } catch (error) {
        console.error("Ошибка при инициализации Telegram:", error);
        // В случае ошибки также используем моковые данные
        setUser(mockUser);
        setTheme("light");
        changeLanguage("ru");
      } finally {
        setIsLoading(false);
      }
    };

    initializeTelegram();
  }, []);

  return {
    isTelegram,
    user,
    theme,
    initData,
    isLoading,
  };
}
