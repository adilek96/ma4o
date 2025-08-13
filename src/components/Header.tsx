"use client";

import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

const Header = () => {
  // const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between p-4 glass-effect sticky top-0 z-50 animate-slideInLeft">
      <h1 className="text-2xl font-bold gradient-text animate-scaleIn">
        {t("app.title")}
      </h1>

      <div className="flex items-center gap-2 animate-slideInRight">
        <Button
          // onClick={() => setLanguage(language === "en" ? "ru" : "en")}
          className="h-8 px-3 text-xs font-medium rounded-full border-primary/20 hover:border-primary/40 btn-bounce glass-effect"
        >
          {/* {language.toUpperCase()} */}ру
        </Button>

        <Button
          // onClick={toggleTheme}
          className="h-8 w-8 p-0 rounded-full border-primary/20 hover:border-primary/40 bg-transparent btn-bounce glass-effect animate-pulse-custom"
        >
          <span className="animate-float">
            {/* {theme === "light" ? "🌙" : "☀️"} */}🌙
          </span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
