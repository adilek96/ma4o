import { useTelegram } from "../hooks/useTelegram";
import { useTheme } from "./ThemeProvider";
import { useTranslation } from "react-i18next";

export function TelegramDebug() {
  const { isTelegram, user, theme: telegramTheme, isLoading } = useTelegram();
  const { theme, resolvedTheme } = useTheme();
  const { i18n } = useTranslation();

  if (!isTelegram) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-background border border-border rounded-lg p-4 text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Telegram Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? "Yes" : "No"}</div>
        <div>Theme Mode: {theme}</div>
        <div>Resolved Theme: {resolvedTheme}</div>
        <div>Telegram Theme: {telegramTheme || "Unknown"}</div>
        <div>Current Language: {i18n.language}</div>
        {user && (
          <div>
            <div>User: {user.first_name}</div>
            <div>User Lang: {user.language_code}</div>
          </div>
        )}
      </div>
    </div>
  );
}
