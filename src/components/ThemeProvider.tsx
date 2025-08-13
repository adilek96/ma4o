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
    const color = tg?.colorScheme as "light" | "dark" | undefined;
    return color;
  } catch {
    return undefined;
  }
}

function getSystemColorScheme(): "light" | "dark" {
  // Prioritize Telegram if available
  const tgScheme = getTelegramColorScheme();
  if (tgScheme) return tgScheme;
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
  }, [resolvedTheme]);

  // Persist user choice when not system
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
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
    try {
      const tg = (window as any)?.Telegram?.WebApp;
      const handler = () => {
        applyDocumentClass(getSystemColorScheme() === "dark");
      };
      tg?.onEvent?.("themeChanged", handler);
      return () => tg?.offEvent?.("themeChanged", handler);
    } catch {
      /* noop */
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
