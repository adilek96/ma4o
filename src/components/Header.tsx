"use client";

import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";
import logo from "@/assets/logo.png";

const Header = () => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === "en" ? "ru" : "en";
    i18n.changeLanguage(next);
    try {
      localStorage.setItem("lng", next);
    } catch {}
  };

  return (
    <header className="flex items-center justify-between p-4 w-[98%] mx-2 sticky top-2 z-50 animate-slideInLeft rounded-2xl border-2 border-border component-bg shadow-md">
      <Button
        onClick={toggleLanguage}
        variant="outline"
        className="h-8 px-3 text-xs font-medium rounded-full border-border text-foreground btn-bounce"
      >
        {i18n.language?.toUpperCase?.() || "EN"}
      </Button>
      <h1 className="text-2xl font-bold gradient-text animate-scaleIn relative">
        <img src={logo} alt="logo" className="w-30 h-10" />
      </h1>
      <div className="flex items-center gap-2">
        <Button
          onClick={toggleTheme}
          variant="outline"
          className="h-8 px-3 text-xs font-medium rounded-full border-border text-foreground btn-bounce"
          title={`Theme: ${theme} (${resolvedTheme})`}
        >
          {theme === "system" ? "SYS" : resolvedTheme === "dark" ? "🌙" : "☀️"}
        </Button>
      </div>
    </header>
  );
};

export default Header;
