import { useEffect, useState } from "react";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import DiscoverScreen from "./components/DiscoverScreen";
import MatchesScreen from "./components/MatchesScreen";
import ProfileScreen from "./components/ProfileScreen";
import EditProfileScreen from "./components/EditProfileScreen";
// import { useTheme } from "./components/ThemeProvider";

type Screen = "discover" | "matches" | "profile" | "editProfile";

function App() {
  const [active, setActive] = useState<Screen>("discover");
  const lang = localStorage.getItem("lang") || "en";
  if (lang !== "ru" && lang !== "en") {
    localStorage.setItem("lang", "en");
  }
  // const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (!window.Telegram) {
      console.warn(
        "%c[Telegram]",
        "color: red; font-weight: bold;",
        "WebApp API not found"
      );
      return;
    }

    const tg = window.Telegram;
    if (tg) {
      console.log(
        "%c[InitData]",
        "color: #4CAF50; font-weight: bold;",
        tg.initData
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
