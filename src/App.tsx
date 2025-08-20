import { useEffect, useState } from "react";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import DiscoverScreen from "./components/DiscoverScreen";
import MatchesScreen from "./components/MatchesScreen";
import ProfileScreen from "./components/ProfileScreen";
import EditProfileScreen from "./components/EditProfileScreen";
import ProfileSetupForm from "./components/ProfileSetupForm";
import { init, useRawInitData } from "@telegram-apps/sdk-react";
import { useAuth } from "./hooks/useAuth";

type Screen = "discover" | "matches" | "profile" | "editProfile";

function App() {
  const [active, setActive] = useState<Screen>("discover");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const aplication = import.meta.env.VITE_APPLICATION;

  const lang = localStorage.getItem("lang") || "en";
  if (lang !== "ru" && lang !== "en") {
    localStorage.setItem("lang", "en");
  }

  const rawInitData = window.Telegram?.WebApp && useRawInitData();

  useEffect(() => {
    if (window.Telegram?.WebApp && aplication === "production") {
      init();
      try {
        // rawInitData содержит URL query string, нужно её распарсить
        if (rawInitData) {
          const urlParams = new URLSearchParams(rawInitData);
          const userParam = urlParams.get("user");

          if (userParam) {
            const userData = JSON.parse(userParam);
            const userLanguage = userData.language_code;

            if (userLanguage) {
              if (userLanguage !== "ru" && userLanguage !== "en") {
                localStorage.setItem("lang", "en");
              } else {
                localStorage.setItem("lang", userLanguage);
              }
            }
          }
        }
      } catch (error) {
        console.error("Ошибка при парсинге initData:", error);
        // В случае ошибки используем язык по умолчанию
        localStorage.setItem("lang", "en");
      }
    }
  }, []);

  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("user", user);
    // Показываем форму заполнения профиля, если пользователь новый
    if (user && user.isNew) {
      setShowProfileSetup(true);
    }
  }, [user]);

  const handleProfileSetupSubmit = async (profileData: any) => {
    try {
      // Здесь будет API запрос для сохранения профиля
      console.log("Данные профиля:", profileData);

      // После успешного сохранения скрываем форму
      setShowProfileSetup(false);

      // Можно также обновить данные пользователя в store
      // или перезагрузить данные пользователя
    } catch (error) {
      console.error("Ошибка при сохранении профиля:", error);
    }
  };

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

      {/* Форма заполнения профиля */}
      {showProfileSetup && (
        <ProfileSetupForm
          onSubmit={handleProfileSetupSubmit}
          onCancel={() => {}} // Пустая функция, так как отмена недоступна
        />
      )}
    </>
  );
}

export default App;
