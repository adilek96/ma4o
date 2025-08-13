import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeProvider";

export default function ProfileScreen() {
  const { i18n } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const lang = i18n.language === "ru" ? "ru" : "en";

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

  return (
    <div className="p-4 space-y-6 animate-fadeInUp">
      {/* Profile Header */}
      <div className="p-6 text-center shadow-md glass-effect animate-scaleIn rounded-xl component-bg border border-border">
        <div className="w-32 h-32 mx-auto mb-4 ring-4 ring-white/20 transition-all duration-300 hover:ring-white/40 animate-float rounded-full overflow-hidden">
          <img
            src="/placeholder.svg?height=128&width=128"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="text-2xl font-bold text-white mb-1 gradient-text">
          Your Name
        </h3>
        <p className="text-white/70 mb-4">25 years old</p>

        <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white btn-bounce px-6 py-2 rounded-full">
          Edit Profile
        </button>
      </div>

      {/* Bio Section */}
      <div className="p-6 shadow-md glass-effect animate-slideInLeft rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-white mb-3 gradient-text">
          {t.bioTitle}
        </h4>
        <p className="text-white/70 leading-relaxed">
          Love traveling, photography, and meeting new people. Always up for an
          adventure! ✈️📸
        </p>
      </div>

      {/* Interests */}
      <div className="p-6 shadow-md glass-effect animate-slideInRight rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-white mb-4 gradient-text">
          {t.interests}
        </h4>
        <div className="flex flex-wrap gap-2">
          {userInterests.map((interest: string, index: number) => (
            <span
              key={index}
              className="bg-white/20 text-white border border-white/30 hover:bg-white/30 btn-bounce px-3 py-1 rounded-full text-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div className="p-6 shadow-md glass-effect animate-fadeInUp rounded-xl component-bg border border-border">
        <h4 className="font-bold text-lg text-white mb-4 gradient-text">
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
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3 animate-slideInLeft">
        <div className="p-4 shadow-md glass-effect card-hover rounded-xl component-bg border border-border">
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">{t.theme}</span>
            <span className="text-white/70">{isDark ? "Dark" : "Light"}</span>
          </div>
        </div>

        <div className="p-4 shadow-md glass-effect card-hover rounded-xl component-bg border border-border">
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">{t.languageLabel}</span>
            <span className="text-white/70">
              {lang === "en" ? "English" : "Русский"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
