import { useState, useEffect, useOptimistic, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  createProfileAction,
  type ProfileData,
} from "../actions/profileActions";

interface ProfileSetupFormProps {
  onSubmit: (data: ProfileData) => void;
  onCancel: () => void;
}

interface Country {
  code: string;
  name: string;
}

const interests = [
  "sports",
  "music",
  "movies",
  "books",
  "travel",
  "cooking",
  "art",
  "technology",
  "nature",
  "photography",
  "dancing",
  "yoga",
  "gaming",
  "fashion",
  "cars",
  "animals",
];

const languages = [
  "ru",
  "en",
  "es",
  "fr",
  "de",
  "it",
  "zh",
  "ja",
  "ko",
  "ar",
  "pt",
  "tr",
  "pl",
  "cs",
  "hu",
  "fi",
  "sv",
  "no",
  "da",
  "nl",
];

export default function ProfileSetupForm({ onSubmit }: ProfileSetupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    birthDate: "",
    country: "",
    city: "",
    location: undefined,
    gender: "",
    seekingGender: "",
    height: 170,
    interests: [],
    bio: "",
    languages: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const { t, i18n } = useTranslation();

  // Используем useOptimistic для оптимистичных обновлений
  const [, addOptimisticProfile] = useOptimistic<
    ProfileData | null,
    ProfileData
  >(null, (_state, newProfile) => {
    // Возвращаем новый профиль как оптимистичное обновление
    return newProfile;
  });

  // Используем useTransition для обработки асинхронных операций
  const [isPending, startTransition] = useTransition();

  // Загружаем страны из API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const response = await fetch(
          `https://flagcdn.com/${i18n.language}/codes.json`
        );
        const data = await response.json();

        const countriesList: Country[] = Object.entries(data).map(
          ([code, name]) => ({
            code,
            name: name as string,
          })
        );

        setCountries(countriesList);
      } catch (error) {
        console.error("Ошибка загрузки стран:", error);
        // Fallback на английский если текущий язык недоступен
        try {
          const response = await fetch("https://flagcdn.com/en/codes.json");
          const data = await response.json();

          const countriesList: Country[] = Object.entries(data).map(
            ([code, name]) => ({
              code,
              name: name as string,
            })
          );

          setCountries(countriesList);
        } catch (fallbackError) {
          console.error("Ошибка загрузки стран (fallback):", fallbackError);
        }
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [i18n.language]);

  // Блокируем закрытие формы по Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim())
        newErrors.firstName = t("form.validation.firstNameRequired");
      if (!formData.lastName.trim())
        newErrors.lastName = t("form.validation.lastNameRequired");
      if (!formData.birthDate)
        newErrors.birthDate = t("form.validation.birthDateRequired");
      if (!formData.country.trim())
        newErrors.country = t("form.validation.countryRequired");
      if (!formData.city.trim())
        newErrors.city = t("form.validation.cityRequired");

      // Проверка возраста (минимум 18 лет)
      if (formData.birthDate) {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          newErrors.birthDate = t("form.validation.ageRequired");
        }
      }
    }

    if (step === 2) {
      if (!formData.gender)
        newErrors.gender = t("form.validation.genderRequired");
      if (!formData.seekingGender)
        newErrors.seekingGender = t("form.validation.seekingGenderRequired");
      if (formData.height < 120 || formData.height > 210) {
        newErrors.height = t("form.validation.heightRequired");
      }
      if (formData.interests.length === 0) {
        newErrors.interests = t("form.validation.interestsRequired");
      }
    }

    if (step === 3) {
      if (!formData.bio.trim())
        newErrors.bio = t("form.validation.bioRequired");
      if (formData.bio.length < 10) {
        newErrors.bio = t("form.validation.bioMinLength");
      }
      if (formData.bio.length > 500) {
        newErrors.bio = t("form.validation.bioMaxLength");
      }
      if (formData.languages.length === 0) {
        newErrors.languages = t("form.validation.languagesRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Используем оптимистичное обновление при отправке формы
        addOptimisticProfile(formData);

        // Запускаем реальный запрос в транзиции
        startTransition(async () => {
          try {
            const result = await createProfileAction(formData);
            if (result.success) {
              onSubmit(formData);
            } else {
              console.error("Ошибка создания профиля:", result.error);
              // Здесь можно добавить обработку ошибок
            }
          } catch (error) {
            console.error("Неожиданная ошибка при создании профиля:", error);
          }
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (name: keyof ProfileData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
    if (errors.interests) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.interests;
        return newErrors;
      });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(t("form.step1.locationNotSupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        }));
      },
      (error) => {
        console.error("Ошибка получения локации:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(t("form.step1.locationPermissionDenied"));
            break;
          case error.POSITION_UNAVAILABLE:
            alert(t("form.step1.locationUnavailable"));
            break;
          case error.TIMEOUT:
            alert(t("form.step1.locationTimeout"));
            break;
          default:
            alert(t("form.step1.locationError"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 gradient-text">
        {t("form.step1.title")}
      </h2>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step1.firstName")} *
        </label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
            errors.firstName
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "border-border focus:border-border focus:ring-border/20 component-bg"
          }`}
          placeholder={t("form.step1.firstNamePlaceholder")}
        />
        {errors.firstName && (
          <p className="text-destructive text-sm mt-2">{errors.firstName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step1.lastName")} *
        </label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
            errors.lastName
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "border-border focus:border-border focus:ring-border/20 component-bg"
          }`}
          placeholder={t("form.step1.lastNamePlaceholder")}
        />
        {errors.lastName && (
          <p className="text-destructive text-sm mt-2">{errors.lastName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step1.birthDate")} *
        </label>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={(e) => handleInputChange("birthDate", e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
            errors.birthDate
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "border-border focus:border-border focus:ring-border/20 component-bg"
          }`}
        />
        {errors.birthDate && (
          <p className="text-destructive text-sm mt-2">{errors.birthDate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step1.country")} *
        </label>
        <div className="relative">
          <select
            name="country"
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
              errors.country
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border focus:border-border focus:ring-border/20 component-bg"
            }`}
            disabled={loadingCountries}
          >
            <option value="">
              {loadingCountries
                ? t("form.step1.countryLoading")
                : t("form.step1.countrySelect")}
            </option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {formData.country && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <img
                src={`https://flagcdn.com/16x12/${formData.country}.png`}
                alt={`Флаг ${
                  countries.find((c) => c.code === formData.country)?.name || ""
                }`}
                className="w-4 h-3 object-cover rounded-sm"
              />
            </div>
          )}
        </div>
        {errors.country && (
          <p className="text-destructive text-sm mt-2">{errors.country}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step1.city")} *
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={(e) => handleInputChange("city", e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
            errors.city
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "border-border focus:border-border focus:ring-border/20 component-bg"
          }`}
          placeholder={t("form.step1.cityPlaceholder")}
        />
        {errors.city && (
          <p className="text-destructive text-sm mt-2">{errors.city}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step1.location")}
        </label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGetLocation}
            className="w-full px-4 py-3 rounded-2xl border-2 border-border component-bg hover:border-purple-500/50 transition-all duration-200 font-medium text-foreground flex items-center justify-center space-x-2"
          >
            <svg
              className="w-5 h-5"
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
            <span>
              {formData.location
                ? t("form.step1.locationReceived")
                : t("form.step1.getLocation")}
            </span>
          </button>
          {formData.location && (
            <div className="p-3 rounded-2xl border-2 border-green-500/20 component-bg bg-green-500/5">
              <p className="text-sm text-green-600 dark:text-green-400">
                {t("form.step1.locationSuccess")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.location.latitude.toFixed(6)},{" "}
                {formData.location.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 gradient-text">
        {t("form.step2.title")}
      </h2>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step2.gender")} *
        </label>
        <div className="space-y-3">
          {["male", "female", "other"].map((gender) => (
            <label
              key={gender}
              className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
            >
              <input
                type="radio"
                name="gender"
                value={gender}
                checked={formData.gender === gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
              />
              <span className="capitalize text-foreground">
                {t(`form.step2.${gender}`)}
              </span>
            </label>
          ))}
        </div>
        {errors.gender && (
          <p className="text-destructive text-sm mt-2">{errors.gender}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step2.seekingGender")} *
        </label>
        <div className="space-y-3">
          {["male", "female", "any"].map((seekingGender) => (
            <label
              key={seekingGender}
              className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
            >
              <input
                type="radio"
                name="seekingGender"
                value={seekingGender}
                checked={formData.seekingGender === seekingGender}
                onChange={(e) =>
                  handleInputChange("seekingGender", e.target.value)
                }
                className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
              />
              <span className="capitalize text-foreground">
                {t(
                  `form.step2.seeking${
                    seekingGender.charAt(0).toUpperCase() +
                    seekingGender.slice(1)
                  }`
                )}
              </span>
            </label>
          ))}
        </div>
        {errors.seekingGender && (
          <p className="text-destructive text-sm mt-2">
            {errors.seekingGender}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step2.height")} *
        </label>
        <div className="p-4 rounded-2xl border-2 border-border component-bg">
          <div className="flex items-center space-x-4">
            <input
              type="range"
              name="height"
              min="120"
              max="210"
              value={formData.height}
              onChange={(e) =>
                handleInputChange("height", parseInt(e.target.value))
              }
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-lg font-bold text-foreground min-w-[4rem] text-center">
              {formData.height} см
            </span>
          </div>
        </div>
        {errors.height && (
          <p className="text-destructive text-sm mt-2">{errors.height}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step2.interests")} *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {interests.map((interest) => (
            <label
              key={interest}
              className={`flex items-center p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                formData.interests.includes(interest)
                  ? "border-purple-500 component-bg bg-gradient-to-r from-purple-500/10 to-purple-600/10 neon-purple-soft"
                  : "border-border component-bg hover:border-border/50"
              }`}
            >
              <input
                type="checkbox"
                checked={formData.interests.includes(interest)}
                onChange={() => handleInterestToggle(interest)}
                className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
              />
              <span className="text-sm text-foreground">
                {t(`interests.${interest}`)}
              </span>
            </label>
          ))}
        </div>
        {errors.interests && (
          <p className="text-destructive text-sm mt-2">{errors.interests}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 gradient-text">
        {t("form.step3.title")}
      </h2>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step3.bio")} *
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          rows={6}
          maxLength={500}
          className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 resize-none transition-all duration-200 ${
            errors.bio
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "border-border focus:border-border focus:ring-border/20 component-bg"
          }`}
          placeholder={t("form.step3.bioPlaceholder")}
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>
            {formData.bio.length}/500 {t("form.step3.bioCharacters")}
          </span>
        </div>
        {errors.bio && (
          <p className="text-destructive text-sm mt-2">{errors.bio}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step3.languages")} *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((language) => (
            <label
              key={language}
              className={`flex items-center p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                formData.languages.includes(language)
                  ? "border-purple-500 component-bg bg-gradient-to-r from-purple-500/10 to-purple-600/10 neon-purple-soft"
                  : "border-border component-bg hover:border-border/50"
              }`}
            >
              <input
                type="checkbox"
                checked={formData.languages.includes(language)}
                onChange={() => {
                  const updatedLanguages = formData.languages.includes(language)
                    ? formData.languages.filter((l) => l !== language)
                    : [...formData.languages, language];
                  setFormData((prev) => ({
                    ...prev,
                    languages: updatedLanguages,
                  }));
                  if (errors.languages) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.languages;
                      return newErrors;
                    });
                  }
                }}
                className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
              />
              <span className="text-sm text-foreground">
                {t(`languages.${language}`)}
              </span>
            </label>
          ))}
        </div>
        {errors.languages && (
          <p className="text-destructive text-sm mt-2">{errors.languages}</p>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
      onClick={(e) => {
        // Предотвращаем закрытие формы при клике вне её области
        e.stopPropagation();
      }}
    >
      <div className="component-bg rounded-2xl border-2 border-border shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          {/* Прогресс бар */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-3">
              <span>
                {t("form.navigation.step")} {currentStep}{" "}
                {t("form.navigation.of")} 3
              </span>
              <span>{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Контент этапа */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Кнопки навигации */}
          <div className="flex justify-between mt-8 gap-4">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-foreground border-2 border-border rounded-2xl component-bg hover:border-primary/50 transition-all duration-200 font-medium"
              >
                {t("form.navigation.back")}
              </button>
            )}
            <div className="flex-1"></div>
            <button
              onClick={handleNext}
              disabled={isPending}
              className="px-8 py-3 rounded-xl border-border border-2 shadow-md component-bg text-foreground neon-purple-soft transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>{t("form.navigation.saving")}</span>
                </div>
              ) : currentStep === 3 ? (
                t("form.navigation.finish")
              ) : (
                t("form.navigation.next")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
