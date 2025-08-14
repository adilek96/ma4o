import { useEffect, useState } from "react";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import DiscoverScreen from "./components/DiscoverScreen";
import MatchesScreen from "./components/MatchesScreen";
import ProfileScreen from "./components/ProfileScreen";
import EditProfileScreen from "./components/EditProfileScreen";
// import { useTheme } from "./components/ThemeProvider";

// Создаем fallback объект для разработки (только если Telegram API не найден)
if (typeof window !== "undefined" && !window.Telegram?.WebApp) {
  console.log(
    "%c[Telegram]",
    "color: #FF9800; font-weight: bold;",
    "Creating fallback Telegram WebApp for development"
  );
  window.Telegram = {
    WebApp: {
      initData: "",
      initDataUnsafe: {},
      version: "6.0",
      platform: "desktop",
      colorScheme: "light",
      themeParams: {},
      ready: () => console.log("Telegram WebApp ready"),
      expand: () => console.log("Telegram WebApp expand"),
      close: () => console.log("Telegram WebApp close"),
      MainButton: {
        text: "",
        color: "#2481cc",
        textColor: "#ffffff",
        isVisible: false,
        isActive: false,
        show: () => console.log("MainButton show"),
        hide: () => console.log("MainButton hide"),
        enable: () => console.log("MainButton enable"),
        disable: () => console.log("MainButton disable"),
        onClick: (callback: () => void) =>
          console.log("MainButton onClick", callback),
      },
    },
  };
}

type Screen = "discover" | "matches" | "profile" | "editProfile";

function App() {
  const [active, setActive] = useState<Screen>("discover");
  const lang = localStorage.getItem("lang") || "en";
  if (lang !== "ru" && lang !== "en") {
    localStorage.setItem("lang", "en");
  }
  // const { resolvedTheme } = useTheme();
  useEffect(() => {
    // Диагностика
    console.log(
      "%c[Diagnostic]",
      "color: #9C27B0; font-weight: bold;",
      "Checking Telegram WebApp availability..."
    );

    console.log("window.Telegram exists:", !!window.Telegram);
    console.log("window.Telegram.WebApp exists:", !!window.Telegram?.WebApp);
    console.log(
      "window.Telegram.WebApp.initData:",
      window.Telegram?.WebApp?.initData
    );

    // Проверяем, запущено ли приложение в реальном Telegram
    const isTelegramWebApp =
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initData;

    if (!window.Telegram?.WebApp) {
      console.warn(
        "%c[Telegram]",
        "color: red; font-weight: bold;",
        "WebApp API not found - running in development mode"
      );
      return;
    }

    const tg = window.Telegram.WebApp;

    if (isTelegramWebApp) {
      console.log(
        "%c[Telegram]",
        "color: #4CAF50; font-weight: bold;",
        "Running in REAL Telegram Web App!"
      );
    } else {
      console.log(
        "%c[Telegram]",
        "color: #FF9800; font-weight: bold;",
        "Running in DEVELOPMENT mode (fallback)"
      );
    }

    if (tg) {
      console.log(
        "%c[InitData]",
        "color: #4CAF50; font-weight: bold;",
        tg.initData || "Empty (development mode)"
      );
      console.log("%c[InitDataUnsafe]", "color: #2196F3; font-weight: bold;");
      console.table(tg.initDataUnsafe);

      console.log(
        "%c[Version]",
        "color: #FF9800; font-weight: bold;",
        tg.version
      );
      console.log(
        "%c[Platform]",
        "color: #9C27B0; font-weight: bold;",
        tg.platform
      );

      console.log(
        "%c[ColorScheme]",
        "color: #E91E63; font-weight: bold;",
        tg.colorScheme
      );
      console.log(
        "%c[ThemeParams]",
        "color: #00BCD4; font-weight: bold;",
        tg.themeParams
      );

      // Уведомляем Telegram что приложение готово
      tg.ready();
    }
  }, []);

  return (
    <>
      <div className="flex flex-col  justify-center items-center">
        <Header />
        <main className="flex-1 w-full max-w-md mx-auto">
          {active === "discover" && <DiscoverScreen />}
          {active === "matches" && <MatchesScreen language={lang} />}
          {active === "profile" && (
            <ProfileScreen onEdit={() => setActive("editProfile")} />
          )}
          {active === "editProfile" && (
            <EditProfileScreen onBack={() => setActive("profile")} />
          )}
        </main>
        <BottomNavigation
          active={active === "editProfile" ? "profile" : active}
          onNavigate={(s) => setActive(s)}
        />
      </div>
    </>
  );
}

export default App;
