"use client";

import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

const Header = () => {
  // const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between p-4  w-[98%] mx-2 sticky top-2 z-50 animate-slideInLeft rounded-2xl border-2 border-white">
      <Button
        // onClick={() => setLanguage(language === "en" ? "ru" : "en")}
        className="h-8 px-3 text-xs font-medium rounded-full border-primary/20 hover:border-primary/40 btn-bounce glass-effect"
      >
        {/* {language.toUpperCase()} */}ру
      </Button>
      <h1 className="text-2xl font-bold gradient-text animate-scaleIn">
        {t("app.title")}
      </h1>
      <Button
        // onClick={toggleTheme}
        className="h-8 w-8 p-0 rounded-full border-primary/20 hover:border-primary/40 bg-transparent btn-bounce glass-effect animate-pulse-custom"
      >
        <span className="animate-float">
          {/* {theme === "light" ? "🌙" : "☀️"} */}🌙
        </span>
      </Button>
    </header>
  );
};

export default Header;
