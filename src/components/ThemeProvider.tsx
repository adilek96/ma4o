import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getTelegramColorScheme(): "light" | "dark" | undefined {
  try {
    const tg = (window as any)?.Telegram?.WebApp;
    if (tg && tg.colorScheme) {
      return tg.colorScheme as "light" | "dark";
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function getSystemColorScheme(): "light" | "dark" {
  // Prioritize Telegram if available
  const tgScheme = getTelegramColorScheme();
  if (tgScheme) return tgScheme;
  
  // Fallback to system preference
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyDocumentClass(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system" as ThemeMode,
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      // Проверяем, есть ли Telegram WebApp
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg && tg.colorScheme) {
        // Если мы в Telegram, принудительно используем системную тему
        return "system";
      }
      return (localStorage.getItem("theme") as ThemeMode) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const resolvedTheme = useMemo<"light" | "dark">(() => {
    if (theme === "system") return getSystemColorScheme();
    return theme;
  }, [theme]);

  // Apply class on mount and whenever resolved theme changes
  useEffect(() => {
    applyDocumentClass(resolvedTheme === "dark");
    
    // Дополнительная проверка для Telegram при загрузке
    if (theme === "system") {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg && tg.colorScheme) {
        const isDark = tg.colorScheme === "dark";
        applyDocumentClass(isDark);
      }
    }
  }, [resolvedTheme, theme]);

  // Persist user choice when not system
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg && tg.colorScheme && theme === "system") {
        const isDark = tg.colorScheme === "dark";
        applyDocumentClass(isDark);
      }
    };

    // Выполняем инициализацию сразу
    initializeTheme();
    
    // И также через небольшую задержку для надежности
    const timeout = setTimeout(initializeTheme, 100);
    
    return () => clearTimeout(timeout);
  }, [theme]);

  // React to OS changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyDocumentClass(getSystemColorScheme() === "dark");
    };
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [theme]);

  // React to Telegram theme changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;
    
    const handleThemeChange = () => {
      const newScheme = getSystemColorScheme();
      applyDocumentClass(newScheme === "dark");
    };
    
    try {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg) {
        // Подписываемся на изменение темы
        if (tg.onEvent) {
          tg.onEvent("themeChanged", handleThemeChange);
        }
        
        // Также слушаем изменения через viewportChanged
        if (tg.onEvent) {
          tg.onEvent("viewportChanged", handleThemeChange);
        }
        
        // Периодическая проверка темы (fallback)
        const interval = setInterval(() => {
          if (tg.colorScheme) {
            const currentScheme = getSystemColorScheme();
            const isDark = currentScheme === "dark";
            if (document.documentElement.classList.contains("dark") !== isDark) {
              applyDocumentClass(isDark);
            }
          }
        }, 1000);
        
        return () => {
          if (tg.offEvent) {
            tg.offEvent("themeChanged", handleThemeChange);
            tg.offEvent("viewportChanged", handleThemeChange);
          }
          clearInterval(interval);
        };
      }
    } catch (error) {
      console.error("Ошибка при подписке на события Telegram:", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "system" ? "dark" : prev === "dark" ? "light" : "system"
    );
  };

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

