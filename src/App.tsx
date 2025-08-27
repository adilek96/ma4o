import { useEffect, useState } from "react";
import BottomNavigation from "./components/BottomNavigation";
import Header from "./components/Header";
import DiscoverScreen from "./components/DiscoverScreen";
import MatchesScreen from "./components/MatchesScreen";
import ProfileScreen from "./components/ProfileScreen";
import ProfileSetupForm from "./components/ProfileSetupForm";
import PreferencesSetupForm from "./components/PreferencesSetupForm";
import PhotoUploadForm from "./components/PhotoUploadForm";
import { init } from "@telegram-apps/sdk-react";
import { useAuth } from "./hooks/useAuth";
import { useTelegram } from "./hooks/useTelegram";
import { useTheme } from "./components/ThemeProvider";
import { TelegramDebug } from "./components/TelegramDebug";
import {
  createProfileAction,
  updateProfileAction,
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
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
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
    console.log("isTelegram используется телеграм", isTelegram);
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

  const { user, loading, refreshUserData } = useAuth();

  useEffect(() => {
    // Показываем форму заполнения профиля, если пользователь новый
    if (user && user.isNew) {
      setShowProfileSetup(true);
      setShowPreferencesSetup(false);
      setShowPhotoUpload(false);
    }
    // Показываем форму предпочтений, если пользователь не новый и предпочтения НЕ заполнены
    else if (user && !user.isNew && !user.isPreferences) {
      setShowProfileSetup(false);
      setShowPreferencesSetup(true);
      setShowPhotoUpload(false);
    }
    // Показываем форму фотографий, если предпочтения заполнены, но нет фотографий
    else if (
      user &&
      !user.isNew &&
      user.isPreferences &&
      (!user.photos || user.photos.length === 0)
    ) {
      setShowProfileSetup(false);
      setShowPreferencesSetup(false);
      setShowPhotoUpload(true);
    }
    // Если пользователь не новый, предпочтения заполнены и есть фотографии, скрываем все формы
    else if (
      user &&
      !user.isNew &&
      user.isPreferences &&
      user.photos &&
      user.photos.length > 0
    ) {
      setShowProfileSetup(false);
      setShowPreferencesSetup(false);
      setShowPhotoUpload(false);
    }
  }, [user]);

  const handleProfileSetupSubmit = async (profileData: ProfileData) => {
    try {
      // Вызываем API для создания профиля
      const result = await createProfileAction(profileData);

      if (result.success) {
        // После успешного сохранения скрываем форму
        setShowProfileSetup(false);
        // Обновляем данные пользователя, чтобы useEffect сработал и показал форму предпочтений
        await refreshUserData();
      } else {
        console.error("Ошибка при создании профиля:", result.error);
        // Здесь можно добавить обработку ошибок для пользователя
      }
    } catch (error) {
      console.error("Ошибка при сохранении профиля:", error);
    }
  };

  // Функция для преобразования данных профиля из API в ProfileData
  const transformProfileData = (
    apiProfile: any,
    userData: any
  ): ProfileData => {
    // Преобразуем пол в нижний регистр
    const gender = apiProfile.gender ? apiProfile.gender.toLowerCase() : "";

    // Преобразуем дату в формат YYYY-MM-DD для input type="date"
    let birthDate = "";
    if (apiProfile.birthDate) {
      try {
        const date = new Date(apiProfile.birthDate);
        birthDate = date.toISOString().split("T")[0]; // Получаем только дату без времени
      } catch (error) {
        birthDate = "";
      }
    }

    const transformedData = {
      userId: apiProfile.userId,
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      gender: gender,
      birthDate: birthDate,
      height: apiProfile.height || 170,
      country: apiProfile.country || "",
      city: apiProfile.city || "",
      latitude: apiProfile.latitude || 0,
      longitude: apiProfile.longitude || 0,
      languages: apiProfile.languages || [],
      bio: apiProfile.bio || "",
      interests: apiProfile.interests || [],
      education: apiProfile.education || undefined,
      occupation: apiProfile.occupation || undefined,
      smoking: apiProfile.smoking || undefined,
      drinking: apiProfile.drinking || undefined,
    };
    return transformedData;
  };

  const handleProfileEditSubmit = async (profileData: ProfileData) => {
    try {
      // Вызываем API для обновления профиля
      const result = await updateProfileAction(profileData);

      if (result.success) {
        // После успешного обновления возвращаемся к профилю
        setActive("profile");
        // Обновляем данные пользователя
        await refreshUserData();
      } else {
        console.error("Ошибка при обновлении профиля:", result.error);
        // Здесь можно добавить обработку ошибок для пользователя
      }
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
    }
  };

  const handlePreferencesSetupSubmit = async (
    preferencesData: PreferencesData
  ) => {
    try {
      // Вызываем API для создания предпочтений
      const result = await createPreferencesAction(preferencesData);

      if (result.success) {
        // После успешного сохранения скрываем форму
        setShowPreferencesSetup(false);
        // Обновляем данные пользователя
        await refreshUserData();
      } else {
        console.error("Ошибка при создании предпочтений:", result.error);
        // Здесь можно добавить обработку ошибок для пользователя
      }
    } catch (error) {
      console.error("Ошибка при сохранении предпочтений:", error);
    }
  };

  const handlePhotoUploadComplete = async () => {
    try {
      // Скрываем форму загрузки фотографий
      setShowPhotoUpload(false);
      // Обновляем данные пользователя
      await refreshUserData();
    } catch (error) {
      console.error("Ошибка при завершении загрузки фотографий:", error);
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
          {active === "editProfile" &&
            user &&
            (() => {
              const transformedData = user.profile
                ? transformProfileData(user.profile, user)
                : undefined;

              return (
                <ProfileSetupForm
                  onSubmit={handleProfileEditSubmit}
                  onCancel={() => setActive("profile")}
                  userId={user.id}
                  isEditMode={true}
                  initialData={transformedData}
                  userData={{
                    firstName: user.firstName,
                    lastName: user.lastName,
                  }}
                />
              );
            })()}
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
          userData={{
            firstName: user.firstName,
            lastName: user.lastName,
          }}
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

      {/* Форма загрузки фотографий */}
      {showPhotoUpload && user && (
        <PhotoUploadForm
          onClose={() => {}} // Пустая функция, так как отмена недоступна
          onSave={handlePhotoUploadComplete}
        />
      )}

      {/* Отладочная информация для Telegram */}
      <TelegramDebug />
    </>
  );
}

export default App;
