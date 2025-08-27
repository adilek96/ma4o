import { useState, useEffect, useOptimistic, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  createProfileAction,
  updateProfileAction,
  type ProfileData,
  SMOKING_OPTIONS,
  DRINKING_OPTIONS,
  EDUCATION_OPTIONS,
  OCCUPATION_OPTIONS,
} from "../actions/profileActions";
import { interests, languages } from "../constants";

interface ProfileSetupFormProps {
  onSubmit: (data: ProfileData) => void;
  onCancel: () => void;
  userId: string;
  // Новые пропсы для режима редактирования
  isEditMode?: boolean;
  initialData?: ProfileData;
  // Данные пользователя для заполнения имени и фамилии
  userData?: {
    firstName?: string;
    lastName?: string;
  };
}

interface Country {
  code: string;
  name: string;
}

export default function ProfileSetupForm({
  onSubmit,
  onCancel,
  userId,
  isEditMode = false,
  initialData,
  userData,
}: ProfileSetupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileData>({
    userId: userId,
    // Основная информация
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    gender: "",
    birthDate: "",
    height: 170,
    // Локация
    country: "",
    city: "",
    latitude: 0,
    longitude: 0,
    // Дополнительная информация
    languages: [],
    bio: "",
    interests: [],
    education: undefined,
    occupation: undefined,
    smoking: undefined,
    drinking: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressReceived, setAddressReceived] = useState(false);
  const { t, i18n } = useTranslation();

  // Заполняем форму начальными данными при редактировании
  useEffect(() => {
    if (isEditMode && initialData) {
      // Убеждаемся, что пол в нижнем регистре
      const gender = initialData.gender ? initialData.gender.toLowerCase() : "";

      // Убеждаемся, что дата в правильном формате
      let birthDate = "";
      if (initialData.birthDate) {
        try {
          const date = new Date(initialData.birthDate);
          birthDate = date.toISOString().split("T")[0];
        } catch (error) {
          birthDate = initialData.birthDate;
        }
      }

      const newFormData = {
        userId: userId,
        // Основная информация
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        gender: gender,
        birthDate: birthDate,
        height: initialData.height || 170,
        // Локация
        country: initialData.country || "",
        city: initialData.city || "",
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        // Дополнительная информация
        languages: initialData.languages || [],
        bio: initialData.bio || "",
        interests: initialData.interests || [],
        education: initialData.education,
        occupation: initialData.occupation,
        smoking: initialData.smoking,
        drinking: initialData.drinking,
      };
      setFormData(newFormData);
    }
  }, [isEditMode, initialData, userId]);

  // Принудительное обновление при изменении initialData
  useEffect(() => {
    if (isEditMode && initialData) {
      // Убеждаемся, что пол в нижнем регистре
      const gender = initialData.gender ? initialData.gender.toLowerCase() : "";

      // Убеждаемся, что дата в правильном формате
      let birthDate = "";
      if (initialData.birthDate) {
        try {
          const date = new Date(initialData.birthDate);
          birthDate = date.toISOString().split("T")[0];
        } catch (error) {
          birthDate = initialData.birthDate;
        }
      }

      const updatedFormData = {
        ...formData,
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        gender: gender,
        birthDate: birthDate,
        height: initialData.height || 170,
        country: initialData.country || "",
        city: initialData.city || "",
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        languages: initialData.languages || [],
        bio: initialData.bio || "",
        interests: initialData.interests || [],
        education: initialData.education,
        occupation: initialData.occupation,
        smoking: initialData.smoking,
        drinking: initialData.drinking,
      };

      setFormData(updatedFormData);
    }
  }, [initialData, isEditMode]);

  // Дополнительный useEffect для принудительного обновления при изменении initialData
  useEffect(() => {
    if (isEditMode && initialData) {
      // Убеждаемся, что пол в нижнем регистре
      const gender = initialData.gender ? initialData.gender.toLowerCase() : "";

      // Убеждаемся, что дата в правильном формате
      let birthDate = "";
      if (initialData.birthDate) {
        try {
          const date = new Date(initialData.birthDate);
          birthDate = date.toISOString().split("T")[0];
        } catch (error) {
          birthDate = initialData.birthDate;
        }
      }

      setFormData((prev) => ({
        ...prev,
        gender: gender,
        birthDate: birthDate,
        height: initialData.height || 170,
      }));
    }
  }, [
    initialData?.gender,
    initialData?.birthDate,
    initialData?.height,
    isEditMode,
  ]);

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // Валидация userId (проверяем на всех этапах)
    if (!formData.userId) {
      newErrors.userId = t("form.validation.userIdRequired");
    }

    if (step === 1) {
      // Валидация основной информации
      if (!formData.firstName.trim())
        newErrors.firstName = t("form.validation.firstNameRequired");
      if (!formData.lastName.trim())
        newErrors.lastName = t("form.validation.lastNameRequired");
      if (!formData.birthDate)
        newErrors.birthDate = t("form.validation.birthDateRequired");
      if (!formData.gender)
        newErrors.gender = t("form.validation.genderRequired");
      if (formData.height < 120 || formData.height > 210) {
        newErrors.height = t("form.validation.heightRequired");
      }

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
      // Валидация локации
      if (!formData.country.trim())
        newErrors.country = t("form.validation.countryRequired");
      if (!formData.city.trim())
        newErrors.city = t("form.validation.cityRequired");
    }

    if (step === 3) {
      // Валидация интересов и языков
      if (formData.interests.length === 0) {
        newErrors.interests = t("form.validation.interestsRequired");
      }
      if (formData.languages.length === 0) {
        newErrors.languages = t("form.validation.languagesRequired");
      }
    }

    if (step === 4) {
      // Валидация дополнительной информации
      if (!formData.bio.trim())
        newErrors.bio = t("form.validation.bioRequired");
      if (formData.bio.length < 10) {
        newErrors.bio = t("form.validation.bioMinLength");
      }
      if (formData.bio.length > 500) {
        newErrors.bio = t("form.validation.bioMaxLength");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // Используем оптимистичное обновление при отправке формы
        addOptimisticProfile(formData);

        // Запускаем реальный запрос в транзиции
        startTransition(async () => {
          try {
            const result = isEditMode
              ? await updateProfileAction(formData)
              : await createProfileAction(formData);

            if (result.success) {
              onSubmit(formData);
            } else {
              console.error(
                isEditMode
                  ? "Ошибка обновления профиля:"
                  : "Ошибка создания профиля:",
                result.error
              );
              // Здесь можно добавить обработку ошибок
            }
          } catch (error) {
            console.error(
              isEditMode
                ? "Неожиданная ошибка при обновлении профиля:"
                : "Неожиданная ошибка при создании профиля:",
              error
            );
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
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      return newData;
    });
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Сбрасываем состояние получения адреса при изменении страны или города вручную
    if (name === "country" || name === "city") {
      setAddressReceived(false);
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
      alert(t("form.step2.locationNotSupported"));
      return;
    }

    setLoadingAddress(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Обновляем координаты
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

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

            if (country) {
              // Находим код страны в нашем списке
              const countryObj = countries.find(
                (c) =>
                  c.code.toLowerCase() === country.toLowerCase() ||
                  c.name.toLowerCase() === country.toLowerCase()
              );

              if (countryObj) {
                setFormData((prev) => ({
                  ...prev,
                  country: countryObj.code,
                }));
              }
            }

            if (city) {
              setFormData((prev) => ({
                ...prev,
                city: city,
              }));
            }

            // Показываем уведомление об успешном получении адреса
            if (country || city) {
              console.log("Адрес успешно получен:", { country, city });
              setAddressReceived(true);
            }
          }
        } catch (error) {
          console.error("Ошибка получения адреса:", error);
          // Не показываем ошибку пользователю, так как координаты все равно получены
        } finally {
          setLoadingAddress(false);
        }
      },
      (error) => {
        console.error("Ошибка получения локации:", error);
        setLoadingAddress(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(t("form.step2.locationPermissionDenied"));
            break;
          case error.POSITION_UNAVAILABLE:
            alert(t("form.step2.locationUnavailable"));
            break;
          case error.TIMEOUT:
            alert(t("form.step2.locationTimeout"));
            break;
          default:
            alert(t("form.step2.locationError"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Этап 1: Основная информация
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
        <div className="relative">
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate || ""}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.birthDate
                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                : "border-border focus:border-border focus:ring-border/20 component-bg"
            }`}
          />
        </div>

        {errors.birthDate && (
          <p className="text-destructive text-sm mt-2">{errors.birthDate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step1.gender")} *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {["male", "female", "other"].map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => handleInputChange("gender", gender)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 font-medium ${
                formData.gender === gender
                  ? "border-purple-500 component-bg bg-gradient-to-r from-purple-500/10 to-purple-600/10 neon-purple-soft text-purple-600 dark:text-purple-400"
                  : "border-border component-bg hover:border-border/50 text-foreground"
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formData.gender === gender
                      ? "bg-purple-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {gender === "male" && (
                    <span className="text-lg font-bold">♂</span>
                  )}
                  {gender === "female" && (
                    <span className="text-lg font-bold">♀</span>
                  )}
                  {gender === "other" && (
                    <span className="text-lg font-bold">⚧</span>
                  )}
                </div>
                <span className="text-sm capitalize">
                  {t(`form.step1.${gender}`)}
                </span>
              </div>
            </button>
          ))}
        </div>
        {errors.gender && (
          <p className="text-destructive text-sm mt-2">{errors.gender}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step1.height")} *
        </label>
        <div className="space-y-4">
          {/* Кастомный ввод */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground">Введите рост:</span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="120"
                max="210"
                value={formData.height || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= 120 && value <= 210) {
                    handleInputChange("height", value);
                  }
                }}
                className="w-20 px-3 py-2 rounded-lg border-2 border-border component-bg text-center focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                placeholder="170"
              />
              <span className="text-sm text-muted-foreground">см</span>
            </div>
          </div>

          {/* Слайдер для точной настройки */}
          <div className="p-4 rounded-2xl border-2 border-border component-bg">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">120</span>
              <input
                type="range"
                name="height"
                min="120"
                max="210"
                value={formData.height || 170}
                onChange={(e) =>
                  handleInputChange("height", parseInt(e.target.value))
                }
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-muted-foreground">210</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-lg font-bold text-foreground">
                {formData.height || 170} см
              </span>
            </div>
          </div>
        </div>
        {errors.height && (
          <p className="text-destructive text-sm mt-2">{errors.height}</p>
        )}
      </div>
    </div>
  );

  // Этап 2: Локация
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 gradient-text">
        {t("form.step2.title")}
      </h2>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step2.country")} *
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
                ? t("form.step2.countryLoading")
                : t("form.step2.countrySelect")}
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
          {t("form.step2.city")} *
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
          placeholder={t("form.step2.cityPlaceholder")}
        />
        {errors.city && (
          <p className="text-destructive text-sm mt-2">{errors.city}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step2.location")}
        </label>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={loadingAddress}
            className="w-full px-4 py-3 rounded-2xl border-2 border-border component-bg hover:border-purple-500/50 transition-all duration-200 font-medium text-foreground flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAddress ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
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
            )}
            <span>
              {loadingAddress
                ? t("form.step2.locationLoading")
                : formData.latitude !== 0 || formData.longitude !== 0
                ? t("form.step2.locationReceived")
                : t("form.step2.getLocation")}
            </span>
          </button>
          {(formData.latitude !== 0 || formData.longitude !== 0) && (
            <div className="p-3 rounded-2xl border-2 border-green-500/20 component-bg bg-green-500/5">
              <p className="text-sm text-green-600 dark:text-green-400">
                {addressReceived
                  ? t("form.step2.locationAndAddressSuccess")
                  : t("form.step2.locationSuccess")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
              {addressReceived && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {t("form.step2.addressAutoFilled")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Этап 3: Интересы и языки
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 gradient-text">
        {t("form.step3.title")}
      </h2>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step3.interests")} *
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

  // Этап 4: Дополнительная информация
  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6 gradient-text">
        {t("form.step4.title")}
      </h2>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step4.bio")} *
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
          placeholder={t("form.step4.bioPlaceholder")}
        />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>
            {formData.bio.length}/500 {t("form.step4.bioCharacters")}
          </span>
        </div>
        {errors.bio && (
          <p className="text-destructive text-sm mt-2">{errors.bio}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step4.smoking")}
        </label>
        <div className="space-y-3">
          {SMOKING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
            >
              <input
                type="radio"
                name="smoking"
                value={option.value}
                checked={formData.smoking === option.value}
                onChange={(e) => handleInputChange("smoking", e.target.value)}
                className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step4.drinking")}
        </label>
        <div className="space-y-3">
          {DRINKING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
            >
              <input
                type="radio"
                name="drinking"
                value={option.value}
                checked={formData.drinking === option.value}
                onChange={(e) => handleInputChange("drinking", e.target.value)}
                className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step4.education")}
        </label>
        <div className="space-y-3">
          {EDUCATION_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
            >
              <input
                type="radio"
                name="education"
                value={option.value}
                checked={formData.education === option.value}
                onChange={(e) => handleInputChange("education", e.target.value)}
                className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3 text-foreground">
          {t("form.step4.occupation")}
        </label>
        <div className="space-y-3">
          {OCCUPATION_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
            >
              <input
                type="radio"
                name="occupation"
                value={option.value}
                checked={formData.occupation === option.value}
                onChange={(e) =>
                  handleInputChange("occupation", e.target.value)
                }
                className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
              />
              <span className="text-foreground">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-40 animate-in fade-in duration-300 flex flex-col">
      {/* Заголовок с прогрессом */}
      <div className="flex-shrink-0 component-bg border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="p-2 rounded-xl border border-border component-bg hover:border-primary/50 transition-all duration-200"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {isEditMode
                  ? t("form.navigation.editProfile")
                  : `${t("form.navigation.step")} ${currentStep} ${t(
                      "form.navigation.of"
                    )} 4`}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? t("form.navigation.editDescription")
                  : `${Math.round((currentStep / 4) * 100)}% ${t(
                      "form.navigation.complete"
                    )}`}
              </p>
            </div>
          </div>
        </div>

        {/* Прогресс бар */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out progress-neon"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto pb-4">
          {/* Контент этапа */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
      </div>

      {/* Фиксированная кнопка внизу */}
      <div className="flex-shrink-0 component-bg border-t border-border px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex gap-3">
            {/* Показываем кнопку отмены только в режиме редактирования или на шагах после первого */}
            {(isEditMode || currentStep > 1) && (
              <button
                onClick={currentStep === 1 ? onCancel : handleBack}
                className="flex-1 px-8 py-4 rounded-xl border-border border-2 shadow-md component-bg text-foreground hover:border-red-500/50 transition-all duration-200 font-medium"
              >
                {currentStep === 1
                  ? t("form.navigation.cancel")
                  : t("form.navigation.back")}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isPending}
              className={`px-8 py-4 rounded-xl border-border border-2 shadow-md component-bg text-foreground neon-purple-soft transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                isEditMode || currentStep > 1 ? "flex-1" : "w-full"
              }`}
            >
              {isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>{t("form.navigation.saving")}</span>
                </div>
              ) : currentStep === 4 ? (
                isEditMode ? (
                  t("form.navigation.save")
                ) : (
                  t("form.navigation.finish")
                )
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
