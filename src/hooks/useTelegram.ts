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

export function useTelegram(): UseTelegramReturn {
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        const tg = (window as any)?.Telegram?.WebApp;
        
        if (tg) {
          setIsTelegram(true);
          setInitData(tg.initData);
          
          // Получаем тему
          if (tg.colorScheme) {
            setTheme(tg.colorScheme);
          } else {
            // Если тема не определена, проверяем через некоторое время
            setTimeout(() => {
              if (tg.colorScheme) {
                setTheme(tg.colorScheme);
              }
            }, 100);
          }
          
          // Парсим данные пользователя
          if (tg.initData) {
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
          
          // Подписываемся на изменения темы
          if (tg.onEvent) {
            const themeHandler = () => {
              if (tg.colorScheme) {
                setTheme(tg.colorScheme);
              }
            };
            
            tg.onEvent("themeChanged", themeHandler);
            
            // Также слушаем изменения через другие события
            const viewportHandler = () => {
              setTimeout(() => {
                if (tg.colorScheme) {
                  setTheme(tg.colorScheme);
                }
              }, 100);
            };
            
            tg.onEvent("viewportChanged", viewportHandler);
            
            // Очистка при размонтировании
            return () => {
              if (tg.offEvent) {
                tg.offEvent("themeChanged", themeHandler);
                tg.offEvent("viewportChanged", viewportHandler);
              }
            };
          }
        }
      } catch (error) {
        console.error("Ошибка при инициализации Telegram:", error);
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
