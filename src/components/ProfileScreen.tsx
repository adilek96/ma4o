import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ru } from "../../translation/ru";
import { en } from "../../translation/en";

export default function ProfileScreen({ onEdit }: { onEdit: () => void }) {
  const { i18n } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, loading } = useAuth();

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

  // Получаем данные профиля
  const profile = user?.profile;
  const userAge = profile?.birthDate ? calculateAge(profile.birthDate) : null;
  const userInterests = profile?.interests || [];
  const userBio = profile?.bio || "";
  const userPhotos = new Array(6).fill(
    "/placeholder.svg?height=200&width=200"
  ) as string[];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [locationUpdating, setLocationUpdating] = useState(false);

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
      (position) => {
        // Здесь можно добавить API запрос для обновления локации
        console.log("New location:", position.coords);
        alert(t("profile.locationUpdated"));
        setLocationUpdating(false);
      },
      (error) => {
        console.error("Ошибка получения локации:", error);
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
        setLocationUpdating(false);
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
              src="/placeholder.svg?height=128&width=128"
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
                {interest}
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
                {language}
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
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg text-foreground gradient-text">
            {t("profile.location")}
          </h4>
          <button
            onClick={handleUpdateLocation}
            disabled={locationUpdating}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {locationUpdating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Updating...</span>
              </div>
            ) : (
              t("profile.updateLocation")
            )}
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-foreground/70">
              {t("profile.country")}
            </span>
            <p className="text-foreground font-medium">
              {profile?.country || t("profile.notSpecified")}
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
          {profile?.latitude && profile?.longitude && (
            <div>
              <span className="text-sm text-foreground/70">
                {t("profile.coordinates")}
              </span>
              <p className="text-foreground font-medium">
                {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desired Location */}
      {profile?.desiredLocation && (
        <div className="p-6 shadow-md animate-slideInLeft rounded-xl component-bg border border-border">
          <h4 className="font-bold text-lg text-foreground mb-4 gradient-text">
            {t("profile.desiredLocation")}
          </h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-foreground/70">
                {t("profile.desiredCountry")}
              </span>
              <p className="text-foreground font-medium">
                {profile.desiredLocation.country || t("profile.notSpecified")}
              </p>
            </div>
            <div>
              <span className="text-sm text-foreground/70">
                {t("profile.desiredCity")}
              </span>
              <p className="text-foreground font-medium">
                {profile.desiredLocation.city || t("profile.notSpecified")}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Photos */}
      <div className="p-6 shadow-md animate-fadeInUp rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground mb-4 gradient-text">
          {t("profile.photos")}
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {userPhotos.map((photo: string, index: number) => (
            <div
              key={index}
              className="aspect-square rounded-xl overflow-hidden card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={photo || "/placeholder.svg"}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                onClick={() => setLightboxIndex(index)}
              />
            </div>
          ))}
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
                System
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
              src={userPhotos[lightboxIndex]}
              alt="preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
