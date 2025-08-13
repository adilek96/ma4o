import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export default function ProfileScreen({ onEdit }: { onEdit: () => void }) {
  const { i18n } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const lang = i18n.language === "ru" ? "ru" : "en";
  const changeLanguage = (next: "en" | "ru") => {
    i18n.changeLanguage(next);
    try {
      localStorage.setItem("lng", next);
      localStorage.setItem("lang", next);
    } catch {}
  };

  const translations = {
    en: {
      bioTitle: "Bio",
      interests: "Interests",
      photos: "Photos",
      theme: "Theme",
      languageLabel: "Language",
    },
    ru: {
      bioTitle: "Био",
      interests: "Интересы",
      photos: "Фотографии",
      theme: "Тема",
      languageLabel: "Язык",
    },
  } as const;
  const t = translations[lang];

  const userInterests =
    lang === "ru"
      ? ["Путешествия", "Фотография", "Музыка", "Кофе"]
      : ["Travel", "Photography", "Music", "Coffee"];
  const userPhotos = new Array(6).fill(
    "/placeholder.svg?height=200&width=200"
  ) as string[];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
          Your Name
        </h3>
        <p className="text-foreground/70 mb-4">25 years old</p>

        <button
          onClick={onEdit}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white btn-bounce px-6 py-2 rounded-full"
        >
          Edit Profile
        </button>
      </div>

      <div className="p-4 shadow-md rounded-xl component-bg border border-border">
        <div className="grid grid-cols-3 text-center">
          <CircleStat
            label={lang === "ru" ? "Популярность" : "Popularity"}
            value={76}
          />
          <CircleStat
            label={lang === "ru" ? "Открытость" : "Openness"}
            value={64}
          />
          <CircleStat
            label={lang === "ru" ? "Активность" : "Activity"}
            value={58}
          />
        </div>
      </div>

      {/* Bio Section */}
      <div className="p-6 shadow-md animate-slideInLeft rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground mb-3 gradient-text">
          {t.bioTitle}
        </h4>
        <p className="text-foreground/70 leading-relaxed">
          Love traveling, photography, and meeting new people. Always up for an
          adventure! ✈️📸
        </p>
      </div>

      {/* Interests */}
      <div className="p-6 shadow-md animate-slideInRight rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground mb-4 gradient-text">
          {t.interests}
        </h4>
        <div className="flex flex-wrap gap-2">
          {userInterests.map((interest: string, index: number) => (
            <span
              key={index}
              className="bg-white/20 text-foreground border border-white/30 hover:bg-white/30 btn-bounce px-3 py-1 rounded-full text-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="p-6 shadow-md animate-fadeInUp rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-foreground mb-4 gradient-text">
          {t.photos}
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
            <span className="font-medium text-foreground">{t.theme}</span>
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
              {t.languageLabel}
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
