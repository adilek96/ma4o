import { useEffect, useState } from "react";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import DiscoverScreen from "./components/DiscoverScreen";
import MatchesScreen from "./components/MatchesScreen";
import ProfileScreen from "./components/ProfileScreen";
import EditProfileScreen from "./components/EditProfileScreen";
import { init } from "@telegram-apps/sdk-react";
import { useRawInitData } from "@telegram-apps/sdk-react";

type Screen = "discover" | "matches" | "profile" | "editProfile";

function App() {
  const [active, setActive] = useState<Screen>("discover");
  const lang = localStorage.getItem("lang") || "en";
  if (lang !== "ru" && lang !== "en") {
    localStorage.setItem("lang", "en");
  }

  init();
  const initData = useRawInitData();

  const sendData = async () => {
    try {
      const response = await fetch(
        "http://194.163.151.112:3002/api/v1/auth/tg",
        {
          method: "POST",
          body: JSON.stringify({ initData }),
        }
      );
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(initData);
    sendData();
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
