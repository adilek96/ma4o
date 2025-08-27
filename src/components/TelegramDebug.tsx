import { useTelegram } from "../hooks/useTelegram";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";

export function TelegramDebug() {
  const { isTelegram, user, theme: telegramTheme, isLoading } = useTelegram();
  const { theme, resolvedTheme } = useTheme();
  const { i18n } = useTranslation();
  const { user: authUser, loading: authLoading } = useAuth();
  const [initDataInfo, setInitDataInfo] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateInitDataInfo = () => {
      const aplication = import.meta.env.VITE_APPLICATION;

      if (aplication === "production") {
        if (window.Telegram?.WebApp?.initData) {
          setInitDataInfo("window.Telegram.WebApp.initData");
        } else {
          setInitDataInfo("rawInitData (SDK)");
        }
      } else {
        setInitDataInfo("initDataDev");
      }
    };

    updateInitDataInfo();
  }, []);

  if (!isTelegram) {
    return null;
  }

  return (
    <>
      {/* Кнопка для переключения видимости */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold z-50"
        title="Toggle Debug Info"
      >
        {isVisible ? "×" : "D"}
      </button>

      {/* Дебаг окно */}
      {isVisible && (
        <div className="fixed top-12 right-4 bg-background border border-border rounded-lg p-4 text-xs max-w-xs z-50 shadow-lg">
          <h3 className="font-bold mb-2">Telegram Debug</h3>
          <div className="space-y-1">
            <div>Loading: {isLoading ? "Yes" : "No"}</div>
            <div>Auth Loading: {authLoading ? "Yes" : "No"}</div>
            <div>Theme Mode: {theme}</div>
            <div>Resolved Theme: {resolvedTheme}</div>
            <div>Telegram Theme: {telegramTheme || "Unknown"}</div>
            <div>Current Language: {i18n.language}</div>
            <div>Environment: {import.meta.env.VITE_APPLICATION}</div>
            <div>InitData Source: {initDataInfo}</div>
            {user && (
              <div>
                <div>Telegram User: {user.first_name}</div>
                <div>Telegram User ID: {user.id}</div>
                <div>User Lang: {user.language_code}</div>
              </div>
            )}
            {authUser && (
              <div>
                <div>
                  Auth User: {authUser.firstName} {authUser.lastName}
                </div>
                <div>Auth User ID: {authUser.id}</div>
                <div>Telegram ID: {authUser.telegramId}</div>
                <div>Is New: {authUser.isNew ? "Yes" : "No"}</div>
                <div>
                  Has Preferences: {authUser.isPreferences ? "Yes" : "No"}
                </div>
                <div>Photos Count: {authUser.photos?.length || 0}</div>
              </div>
            )}
            <div>
              WebApp Available: {window.Telegram?.WebApp ? "Yes" : "No"}
            </div>
            <div>
              InitData Available:{" "}
              {window.Telegram?.WebApp?.initData ? "Yes" : "No"}
            </div>
            {window.Telegram?.WebApp?.initData && (
              <div>
                InitData Preview:{" "}
                {window.Telegram.WebApp.initData.substring(0, 50)}
                ...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
