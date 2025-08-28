import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ru } from "../../translation/ru";
import { en } from "../../translation/en";
import PhotoUploadForm from "./PhotoUploadForm";
import PreferencesSetupForm from "./PreferencesSetupForm";
import { interests, languages } from "../constants";

export default function ProfileScreen({ onEdit }: { onEdit: () => void }) {
  const { i18n } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, loading, refreshUserData } = useAuth();

  const lang = i18n.language === "ru" ? "ru" : "en";
  const changeLanguage = (next: "en" | "ru") => {
    i18n.changeLanguage(next);
    try {
      localStorage.setItem("lng", next);
      localStorage.setItem("lang", next);
    } catch {}
  };

  const t = (key: string) => {
    const keys = key.split(".");
    let value: any = lang === "ru" ? ru : en;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Вычисляем возраст из даты рождения
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Получаем данные профиля и предпочтений
  const profile = user?.profile;
  const preferences = user?.preferences;
  const userAge = profile?.birthDate ? calculateAge(profile.birthDate) : null;
  const userInterests = profile?.interests || [];
  const userBio = profile?.bio || "";
  const userPhotos = user?.photos || [];

  // Получаем главную фотографию профиля
  const mainPhoto = userPhotos.find((photo) => photo.isMain) || userPhotos[0];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [locationUpdating, setLocationUpdating] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showPreferencesSetup, setShowPreferencesSetup] = useState(false);
  const [countries, setCountries] = useState<{ code: string; name: string }[]>(
    []
  );

  // Отслеживаем изменения в фотографиях пользователя
  useEffect(() => {
    console.log("ProfileScreen: обновлены фотографии пользователя", userPhotos);
  }, [userPhotos]);

  // Загружаем список стран
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          `https://flagcdn.com/${i18n.language}/codes.json`
        );
        const data = await response.json();

        const countriesList = Object.entries(data).map(([code, name]) => ({
          code,
          name: name as string,
        }));

        setCountries(countriesList);
      } catch (error) {
        console.error("Ошибка загрузки стран:", error);
        // Fallback на английский
        try {
          const response = await fetch("https://flagcdn.com/en/codes.json");
          const data = await response.json();

          const countriesList = Object.entries(data).map(([code, name]) => ({
            code,
            name: name as string,
          }));

          setCountries(countriesList);
        } catch (fallbackError) {
          console.error("Ошибка загрузки стран (fallback):", fallbackError);
        }
      }
    };

    fetchCountries();
  }, [i18n.language]);

  // Функция для получения названия страны по коду
  const getCountryName = (countryCode: string) => {
    const country = countries.find(
      (c) => c.code.toLowerCase() === countryCode.toLowerCase()
    );
    return country ? country.name : countryCode;
  };

  // Функция для получения названия предпочитаемого пола
  const getSeekingGenderName = (seekingGender: string) => {
    switch (seekingGender) {
      case "MALE":
        return t("profile.seekingMale");
      case "FEMALE":
        return t("profile.seekingFemale");
      case "ANY":
        return t("profile.seekingAny");
      case "OTHER":
        return t("profile.seekingOther");
      default:
        return t("profile.notSpecified");
    }
  };

  // Функция для получения названия цели знакомства
  const getDatingGoalName = (datingGoals: string | string[]) => {
    if (!datingGoals) return t("profile.notSpecified");

    const goalsArray = Array.isArray(datingGoals) ? datingGoals : [datingGoals];
    if (goalsArray.length === 0) return t("profile.notSpecified");

    const goals = {
      RELATIONSHIP:
        lang === "ru" ? "Серьезные отношения" : "Serious relationship",
      FRIENDSHIP: lang === "ru" ? "Дружба" : "Friendship",
      CASUAL: lang === "ru" ? "Несерьезные отношения" : "Casual dating",
      MARRIAGE: lang === "ru" ? "Брак" : "Marriage",
      NETWORKING: lang === "ru" ? "Нетворкинг" : "Networking",
    };

    return goalsArray
      .map((goal) => goals[goal as keyof typeof goals] || goal)
      .join(", ");
  };

  // Функция для получения названия предпочитаемой локации
  const getPreferredLocationName = (preferredLocation: string) => {
    const locations = {
      SAME_CITY: lang === "ru" ? "Тот же город" : "Same city",
      SAME_COUNTRY: lang === "ru" ? "Та же страна" : "Same country",
      NEARBY: lang === "ru" ? "Поблизости" : "Nearby",
      ANYWHERE: lang === "ru" ? "Где угодно" : "Anywhere",
    };
    return (
      locations[preferredLocation as keyof typeof locations] ||
      t("profile.notSpecified")
    );
  };

  // Функция для получения названия образования
  const getEducationName = (education: string) => {
    return t(`profile.education.${education}`) || t("profile.notSpecified");
  };

  // Функция для получения названия рода деятельности
  const getOccupationName = (occupation: string) => {
    return t(`profile.occupation.${occupation}`) || t("profile.notSpecified");
  };

  // Функция для получения переведенного названия интереса
  const getInterestName = (interest: string) => {
    // Проверяем, что интерес существует в нашем списке
    if (interests.includes(interest as any)) {
      return t(`interests.${interest}`);
    }
    return interest; // Возвращаем оригинальное значение, если перевод не найден
  };

  // Функция для получения переведенного названия языка
  const getLanguageName = (language: string) => {
    // Проверяем, что язык существует в нашем списке
    if (languages.includes(language as any)) {
      return t(`languages.${language}`);
    }
    return language; // Возвращаем оригинальное значение, если перевод не найден
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      alert(t("profile.locationNotSupported"));
      return;
    }

    setLocationUpdating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Получаем адрес по координатам через Nominatim API
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=${i18n.language}`
          );

          if (!response.ok) {
            throw new Error("Ошибка получения адреса");
          }

          const data = await response.json();

          if (data.address) {
            const address = data.address;

            // Определяем страну и город
            const country =
              address.country || address.country_code?.toUpperCase();
            const city =
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              address.county;

            console.log("Получен адрес:", {
              country,
              city,
              latitude,
              longitude,
            });
            alert(t("profile.locationUpdated"));
          } else {
            alert(t("profile.locationUpdated"));
          }
        } catch (error) {
          console.error("Ошибка получения адреса:", error);
          alert(t("profile.locationUpdated"));
        } finally {
          setLocationUpdating(false);
        }
      },
      (error) => {
        console.error("Ошибка получения локации:", error);
        setLocationUpdating(false);
        let errorMessage: any = t("profile.locationErrorGet");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t("profile.locationPermissionDenied");
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t("profile.locationUnavailable");
            break;
          case error.TIMEOUT:
            errorMessage = t("profile.locationTimeout");
            break;
        }
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const CircleStat = ({ label, value }: { label: string; value: number }) => {
    const deg = Math.min(360, Math.max(0, value * 3.6));
    return (
      <div className="flex flex-col items-center">
        <div
          className="relative size-20 rounded-full"
          style={{
            background: `conic-gradient(var(--ring) ${deg}deg, transparent 0)`,
          }}
        >
          <div className="absolute inset-1 rounded-full component-bg border border-border flex items-center justify-center">
            <span className="text-sm font-semibold text-foreground">
              {value}%
            </span>
          </div>
        </div>
        <div className="text-xs text-foreground/70 mt-2">{label}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-foreground/70">{t("profile.loading")}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-foreground/70">User not found</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-fadeInUp">
      {/* Profile Header */}
      <div className="p-6 text-center shadow-md animate-scaleIn rounded-xl component-bg border border-border">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute -inset-1 rounded-full bg-[conic-gradient(var(--ring),transparent_60%)] blur-sm opacity-70 animate-[spin_8s_linear_infinite]"></div>
          <div className="relative w-full h-full ring-4 ring-white/20 transition-all duration-300 hover:ring-white/40 rounded-full overflow-hidden">
            <img
              src={mainPhoto ? `${mainPhoto.url}` : ""}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-1 gradient-text">
          {user.firstName} {user.lastName}
        </h3>
        {userAge && (
          <p className="text-foreground/70 mb-4">
            {userAge} {t("profile.age")}
          </p>
        )}

        <button
          onClick={onEdit}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white btn-bounce px-6 py-2 rounded-full"
        >
          {t("profile.editProfile")}
        </button>
      </div>

      <div className="p-4 shadow-md rounded-xl component-bg border border-border">
        <div className="grid grid-cols-3 text-center">
          <CircleStat label={t("profile.popularity")} value={76} />
          <CircleStat label={t("profile.openness")} value={64} />
          <CircleStat label={t("profile.activity")} value={58} />
        </div>
      </div>

      {/* Bio Section */}
      <div className="p-6 shadow-md animate-slideInLeft rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground mb-3 gradient-text">
          {t("profile.bioTitle")}
        </h4>
        <p className="text-foreground/70 leading-relaxed">
          {userBio || t("profile.noBio")}
        </p>
      </div>

      {/* Interests */}
      <div className="p-6 shadow-md animate-slideInRight rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground mb-4 gradient-text">
          {t("profile.interests")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {userInterests.length > 0 ? (
            userInterests.map((interest: string, index: number) => (
              <span
                key={index}
                className="bg-white/20 text-foreground border border-white/30 hover:bg-white/30 btn-bounce px-3 py-1 rounded-full text-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {getInterestName(interest)}
              </span>
            ))
          ) : (
            <span className="text-foreground/50 italic">
              {t("profile.noInterests")}
            </span>
          )}
        </div>
      </div>

      {/* Languages */}
      <div className="p-6 shadow-md animate-slideInLeft rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground mb-4 gradient-text">
          {t("profile.languages")}
        </h4>
        <div className="flex flex-wrap gap-2">
          {profile?.languages && profile.languages.length > 0 ? (
            profile.languages.map((language: string, index: number) => (
              <span
                key={index}
                className="bg-white/20 text-foreground border border-white/30 hover:bg-white/30 btn-bounce px-3 py-1 rounded-full text-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {getLanguageName(language)}
              </span>
            ))
          ) : (
            <span className="text-foreground/50 italic">
              {t("profile.noLanguages")}
            </span>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="p-6 shadow-md animate-slideInRight rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground gradient-text mb-4">
          {t("profile.location")}
        </h4>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.country")}
            </span>
            <p className="text-foreground font-medium">
              {profile?.country
                ? getCountryName(profile.country)
                : t("profile.notSpecified")}
            </p>
          </div>
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.city")}
            </span>
            <p className="text-foreground font-medium">
              {profile?.city || t("profile.notSpecified")}
            </p>
          </div>
          <div>
            <button
              onClick={handleUpdateLocation}
              disabled={locationUpdating}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {locationUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{t("profile.updateLocation")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Preferences */}
      <div className="p-6 shadow-md animate-slideInLeft rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground gradient-text mb-4">
          {t("profile.searchPreferences")}
        </h4>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.seekingGender")}
            </span>
            <p className="text-foreground font-medium">
              {preferences?.genderPreference
                ? getSeekingGenderName(preferences.genderPreference)
                : t("profile.notSpecified")}
            </p>
          </div>
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.datingGoal")}
            </span>
            <p className="text-foreground font-medium">
              {preferences?.datingGoalPreference
                ? getDatingGoalName(preferences.datingGoalPreference)
                : t("profile.notSpecified")}
            </p>
          </div>
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.preferredLocation")}
            </span>
            <p className="text-foreground font-medium">
              {preferences?.locationPreference
                ? getPreferredLocationName(preferences.locationPreference)
                : t("profile.notSpecified")}
            </p>
            {/* Показываем дистанцию только если выбрано "Поблизости" */}
            {preferences?.locationPreference === "NEARBY" &&
              preferences?.maxDistance && (
                <div className="mt-2">
                  <span className="text-sm text-foreground/70">
                    {t("profile.maxDistance")}
                  </span>
                  <p className="text-foreground font-medium">
                    {preferences.maxDistance} км
                  </p>
                </div>
              )}
          </div>
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.agePreferences")}
            </span>
            <p className="text-foreground font-medium">
              {preferences?.minAge && preferences?.maxAge
                ? `${preferences.minAge} - ${preferences.maxAge} ${t(
                    "profile.age"
                  )}`
                : t("profile.notSpecified")}
            </p>
          </div>
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.smokingPreference")}
            </span>
            <p className="text-foreground font-medium">
              {preferences?.smokingPreference
                ? t(
                    `preferences.smokingPreferenceOptions.${preferences.smokingPreference}`
                  )
                : t("profile.notSpecified")}
            </p>
          </div>
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.drinkingPreference")}
            </span>
            <p className="text-foreground font-medium">
              {preferences?.drinkingPreference
                ? t(
                    `preferences.drinkingPreferenceOptions.${preferences.drinkingPreference}`
                  )
                : t("profile.notSpecified")}
            </p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowPreferencesSetup(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all duration-200"
          >
            {t("profile.editPreferences")}
          </button>
        </div>
      </div>

      {/* Smoking & Drinking */}
      <div className="p-6 shadow-md animate-slideInRight rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground mb-4 gradient-text">
          {t("profile.habits")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.smoking")}
            </span>
            <p className="text-foreground font-medium">
              {profile?.smoking
                ? lang === "ru"
                  ? profile.smoking === "NEVER"
                    ? "Никогда не курил(а)"
                    : profile.smoking === "OCCASIONALLY"
                      ? "Курю иногда"
                      : profile.smoking === "REGULARLY"
                        ? "Курю регулярно"
                        : profile.smoking === "QUIT"
                          ? "Бросил(а) курить"
                          : "Предпочитаю не говорить"
                  : profile.smoking === "NEVER"
                    ? "Never smoked"
                    : profile.smoking === "OCCASIONALLY"
                      ? "Occasionally"
                      : profile.smoking === "REGULARLY"
                        ? "Regularly"
                        : profile.smoking === "QUIT"
                          ? "Quit"
                          : "Prefer not to say"
                : t("profile.noSmoking")}
            </p>
          </div>
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.drinking")}
            </span>
            <p className="text-foreground font-medium">
              {profile?.drinking
                ? lang === "ru"
                  ? profile.drinking === "NEVER"
                    ? "Не пью алкоголь"
                    : profile.drinking === "OCCASIONALLY"
                      ? "Пью иногда"
                      : profile.drinking === "REGULARLY"
                        ? "Пью регулярно"
                        : profile.drinking === "QUIT"
                          ? "Бросил(а) пить"
                          : "Предпочитаю не говорить"
                  : profile.drinking === "NEVER"
                    ? "Never drink"
                    : profile.drinking === "OCCASIONALLY"
                      ? "Occasionally"
                      : profile.drinking === "REGULARLY"
                        ? "Regularly"
                        : profile.drinking === "QUIT"
                          ? "Quit"
                          : "Prefer not to say"
                : t("profile.noDrinking")}
            </p>
          </div>
        </div>
      </div>

      {/* Education & Occupation */}
      <div className="p-6 shadow-md animate-slideInLeft rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground mb-4 gradient-text">
          {t("profile.educationTitle")} & {t("profile.occupationTitle")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.educationTitle")}
            </span>
            <p className="text-foreground font-medium">
              {profile?.education
                ? getEducationName(profile.education)
                : t("profile.notSpecified")}
            </p>
          </div>
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.occupationTitle")}
            </span>
            <p className="text-foreground font-medium">
              {profile?.occupation
                ? getOccupationName(profile.occupation)
                : t("profile.notSpecified")}
            </p>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="p-6 shadow-md animate-fadeInUp rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground gradient-text mb-4">
          {t("profile.photos")}
        </h4>
        {userPhotos.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {userPhotos.map((photo, index: number) => (
              <div
                key={photo.id}
                className="aspect-square rounded-xl overflow-hidden card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={`${photo.url}`}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                  onClick={() => setLightboxIndex(index)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-4">
            <p className="text-foreground/50 italic">{t("profile.noPhotos")}</p>
          </div>
        )}
        <div className="text-center">
          <button
            onClick={() => setShowPhotoUpload(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all duration-200"
          >
            {t("profile.editPhotos")}
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3 animate-slideInLeft">
        <div className="p-4 shadow-md card-hover rounded-xl component-bg border border-border">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-foreground">
              {t("profile.theme")}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={
                  resolvedTheme === "light" && theme !== "system"
                    ? "default"
                    : "outline"
                }
                onClick={() => setTheme("light")}
              >
                Light
              </Button>
              <Button
                size="sm"
                variant={
                  resolvedTheme === "dark" && theme !== "system"
                    ? "default"
                    : "outline"
                }
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
              <Button
                size="sm"
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
              >
                {theme === "system" && (window as any)?.Telegram?.WebApp
                  ? t("profile.telegramTheme")
                  : "System"}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 shadow-md card-hover rounded-xl component-bg border border-border">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-foreground">
              {t("profile.languageLabel")}
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={lang === "en" ? "default" : "outline"}
                onClick={() => changeLanguage("en")}
              >
                EN
              </Button>
              <Button
                size="sm"
                variant={lang === "ru" ? "default" : "outline"}
                onClick={() => changeLanguage("ru")}
              >
                RU
              </Button>
            </div>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="max-w-md w-[90%] aspect-square rounded-2xl overflow-hidden component-bg border border-border shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={userPhotos[lightboxIndex]?.url || ""}
              alt="preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Photo Upload Form */}
      {showPhotoUpload && (
        <PhotoUploadForm
          onClose={() => setShowPhotoUpload(false)}
          onSave={async () => {
            // Обновляем данные пользователя после сохранения фотографий
            await refreshUserData();
            setShowPhotoUpload(false);
          }}
        />
      )}

      {/* Preferences Setup Form */}
      {showPreferencesSetup && preferences && (
        <PreferencesSetupForm
          userId={user.id}
          isEditMode={true}
          initialData={{
            userId: preferences.userId,
            genderPreference: preferences.genderPreference?.toLowerCase() || "",
            minAge: preferences.minAge,
            maxAge: preferences.maxAge,
            locationPreference: preferences.locationPreference as any,
            maxDistance: preferences.maxDistance,
            datingGoalPreference: Array.isArray(
              preferences.datingGoalPreference
            )
              ? (preferences.datingGoalPreference as any)
              : [preferences.datingGoalPreference as any],
            smokingPreference: preferences.smokingPreference as any,
            drinkingPreference: preferences.drinkingPreference as any,
          }}
          onSubmit={async () => {
            // Обновляем данные пользователя после сохранения предпочтений
            await refreshUserData();
            setShowPreferencesSetup(false);
          }}
          onCancel={() => setShowPreferencesSetup(false)}
        />
      )}
    </div>
  );
}
