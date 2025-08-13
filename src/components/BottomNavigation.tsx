"use client";
import { useTranslation } from "react-i18next";

type Screen = "discover" | "matches" | "messages" | "profile";

interface BottomNavigationProps {
  activeTab: Screen;
  onTabChange: (screen: Screen) => void;
}

const BottomNavigation = ({
  activeTab,
  onTabChange,
}: BottomNavigationProps) => {
  const { t } = useTranslation();

  const navItems = [
    { id: "discover" as Screen, icon: "🔍", label: t("nav.discover") },
    { id: "matches" as Screen, icon: "💕", label: t("nav.matches") },
    { id: "messages" as Screen, icon: "💬", label: t("nav.messages") },
    { id: "profile" as Screen, icon: "👤", label: t("nav.profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-effect border-t border-border/50 z-50 animate-slideInLeft">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 btn-bounce ${
              activeTab === item.id
                ? "bg-gradient-to-r from-primary/20 to-accent/20 scale-105 glass-effect"
                : "hover:bg-muted/50 active:scale-95"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span
              className={`text-xl transition-all duration-300 ${
                activeTab === item.id ? "scale-110 animate-float" : ""
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-xs font-medium transition-all duration-300 ${
                activeTab === item.id
                  ? "gradient-text font-semibold animate-pulse-custom"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
