import { useEffect, useState } from "react";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import DiscoverScreen from "./components/DiscoverScreen";
import MatchesScreen from "./components/MatchesScreen";
import ProfileScreen from "./components/ProfileScreen";
import EditProfileScreen from "./components/EditProfileScreen";
import { init } from "@telegram-apps/sdk-react";
import { useAuth } from "./hooks/useAuth";
// import { useRawInitData } from "@telegram-apps/sdk-react";

type Screen = "discover" | "matches" | "profile" | "editProfile";

function App() {
  const [active, setActive] = useState<Screen>("discover");
  const lang = localStorage.getItem("lang") || "en";
  if (lang !== "ru" && lang !== "en") {
    localStorage.setItem("lang", "en");
  }

  init();
  // const initData = useRawInitData();

  // const sendData = async () => {
  //   try {
  //     const response = await fetch("https://api.ma4o.com/api/v1/auth/tg", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         // Authorization: `tma ${initDataRaw}`,
  //       },
  //       body: JSON.stringify({ initData }),
  //     });
  //     const data = await response.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const debug = async () => {
    const response = await fetch("https://api.ma4o.com/api/v1/user/debug", {
      credentials: "include",
    });
    console.log("debug: response", response);
    const data = await response.json();
    console.log("debug", data);
  };

  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("user", user);
    debug();
  }, [user]);

  // Показываем загрузку пока проверяется авторизация
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

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
