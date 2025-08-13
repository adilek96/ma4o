import { useState } from "react";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import DiscoverScreen from "./components/DiscoverScreen";
import MatchesScreen from "./components/MatchesScreen";
import ProfileScreen from "./components/ProfileScreen";
import Iridescence from "./components/Iridescence";
import { useTheme } from "./components/ThemeProvider";

type Screen = "discover" | "matches" | "profile";

function App() {
  const [active, setActive] = useState<Screen>("discover");
  const lang = localStorage.getItem("lang") || "en";
  if (lang !== "ru" && lang !== "en") {
    localStorage.setItem("lang", "en");
  }
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          zIndex: -1,
        }}
      >
        <Iridescence
          color={isDark ? [0.2, 0.2, 0.2] : [1, 1, 1]}
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      <div className="flex flex-col  justify-center items-center">
        <Header />
        <main className="flex-1 w-full max-w-md mx-auto">
          {active === "discover" && <DiscoverScreen />}
          {active === "matches" && <MatchesScreen language={lang} />}
          {active === "profile" && <ProfileScreen />}
        </main>
        <BottomNavigation active={active} onNavigate={setActive} />
      </div>
    </>
  );
}

export default App;
