import { useEffect, useState } from "react";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import DiscoverScreen from "./components/DiscoverScreen";
import MatchesScreen from "./components/MatchesScreen";
import ProfileScreen from "./components/ProfileScreen";
import EditProfileScreen from "./components/EditProfileScreen";
import ProfileSetupForm from "./components/ProfileSetupForm";
import PreferencesSetupForm from "./components/PreferencesSetupForm";
import { init } from "@telegram-apps/sdk-react";
import { useAuth } from "./hooks/useAuth";
import { useTelegram } from "./hooks/useTelegram";
import { useTheme } from "./components/ThemeProvider";
import { TelegramDebug } from "./components/TelegramDebug";
import {
  createProfileAction,
  type ProfileData,
} from "./actions/profileActions";
import {
  createPreferencesAction,
  type PreferencesData,
} from "./actions/preferencesActions";

type Screen = "discover" | "matches" | "profile" | "editProfile";

function App() {
  const [active, setActive] = useState<Screen>("discover");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showPreferencesSetup, setShowPreferencesSetup] = useState(false);
  const { setTheme } = useTheme();
  const {
    isTelegram,
    theme: telegramTheme,
    isLoading: telegramLoading,
  } = useTelegram();

  // Инициализация Telegram SDK
  useEffect(() => {
    if (isTelegram && import.meta.env.VITE_APPLICATION === "production") {
      init();
    }
  }, [isTelegram]);

  // Синхронизация темы с Telegram
  useEffect(() => {
    if (isTelegram && telegramTheme) {
      setTheme("system");
      const root = document.documentElement;
      if (telegramTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [isTelegram, telegramTheme, setTheme]);

  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("user", user);
    console.log("user.isNew:", user?.isNew);
    console.log("user.isPreferences:", user?.isPreferences);

    // Показываем форму заполнения профиля, если пользователь новый
    if (user && user.isNew) {
      console.log("Показываем форму профиля");
      setShowProfileSetup(true);
      setShowPreferencesSetup(false);
    }
    // Показываем форму предпочтений, если пользователь не новый и предпочтения НЕ заполнены
    else if (user && !user.isNew && !user.isPreferences) {
      console.log("Показываем форму предпочтений");
      setShowProfileSetup(false);
      setShowPreferencesSetup(true);
    }
    // Если пользователь не новый и предпочтения заполнены, скрываем обе формы
    else if (user && !user.isNew && user.isPreferences) {
      console.log("Скрываем обе формы");
      setShowProfileSetup(false);
      setShowPreferencesSetup(false);
    }
  }, [user]);

  const handleProfileSetupSubmit = async (profileData: ProfileData) => {
    try {
      // Вызываем API для создания профиля
      const result = await createProfileAction(profileData);

      if (result.success) {
        console.log("Профиль успешно создан:", result.profileId);
        // После успешного сохранения скрываем форму
        setShowProfileSetup(false);
        // Можно также обновить данные пользователя в store
        // или перезагрузить данные пользователя
      } else {
        console.error("Ошибка при создании профиля:", result.error);
        // Здесь можно добавить обработку ошибок для пользователя
      }
    } catch (error) {
      console.error("Ошибка при сохранении профиля:", error);
    }
  };

  const handlePreferencesSetupSubmit = async (
    preferencesData: PreferencesData
  ) => {
    try {
      // Вызываем API для создания предпочтений
      const result = await createPreferencesAction(preferencesData);

      if (result.success) {
        console.log("Предпочтения успешно созданы:", result.preferencesId);
        // После успешного сохранения скрываем форму
        setShowPreferencesSetup(false);
        // Можно также обновить данные пользователя в store
        // или перезагрузить данные пользователя
      } else {
        console.error("Ошибка при создании предпочтений:", result.error);
        // Здесь можно добавить обработку ошибок для пользователя
      }
    } catch (error) {
      console.error("Ошибка при сохранении предпочтений:", error);
    }
  };

  // Показываем загрузку пока проверяется авторизация и Telegram
  if (loading || telegramLoading) {
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
          {active === "matches" && (
            <MatchesScreen language={localStorage.getItem("lng") || "en"} />
          )}
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
      {showProfileSetup && user && (
        <ProfileSetupForm
          onSubmit={handleProfileSetupSubmit}
          onCancel={() => {}} // Пустая функция, так как отмена недоступна
          userId={user.id}
        />
      )}

      {/* Форма заполнения предпочтений */}
      {showPreferencesSetup && user && (
        <PreferencesSetupForm
          onSubmit={handlePreferencesSetupSubmit}
          onCancel={() => {}} // Пустая функция, так как отмена недоступна
          userId={user.id}
        />
      )}

      {/* Отладочная информация для Telegram */}
      <TelegramDebug />
    </>
  );
}

export default App;
