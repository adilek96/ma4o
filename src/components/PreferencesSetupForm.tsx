import { useState, useOptimistic, useTransition, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  createPreferencesAction,
  updatePreferencesAction,
  type PreferencesData,
  DATING_GOALS,
  SMOKING_PREFERENCE_OPTIONS,
  DRINKING_PREFERENCE_OPTIONS,
  PREFERRED_LOCATION_OPTIONS,
} from "../actions/preferencesActions";

interface PreferencesSetupFormProps {
  onSubmit: (data: PreferencesData) => void;
  onCancel: () => void;
  userId: string;
  // Новые пропсы для режима редактирования
  isEditMode?: boolean;
  initialData?: PreferencesData;
}

export default function PreferencesSetupForm({
  onSubmit,
  onCancel,
  userId,
  isEditMode = false,
  initialData,
}: PreferencesSetupFormProps) {
  const [formData, setFormData] = useState<PreferencesData>({
    userId: userId,
    genderPreference: "",
    minAge: 18,
    maxAge: 35,
    locationPreference: "",
    maxDistance: 50,
    datingGoalPreference: [],
    smokingPreference: undefined,
    drinkingPreference: undefined,
  });
  // Отдельные состояния для отображения полей возраста
  const [minAgeDisplay, setMinAgeDisplay] = useState<string>("18");
  const [maxAgeDisplay, setMaxAgeDisplay] = useState<string>("35");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  // Заполняем форму начальными данными при редактировании
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        userId: userId,
        genderPreference: initialData.genderPreference || "",
        minAge: initialData.minAge || 18,
        maxAge: initialData.maxAge || 35,
        locationPreference: initialData.locationPreference || "",
        maxDistance: initialData.maxDistance || 50,
        datingGoalPreference: initialData.datingGoalPreference || [],
        smokingPreference: initialData.smokingPreference,
        drinkingPreference: initialData.drinkingPreference,
      });
      // Обновляем отображаемые значения
      setMinAgeDisplay(String(initialData.minAge || 18));
      setMaxAgeDisplay(String(initialData.maxAge || 35));
    }
  }, [isEditMode, initialData, userId]);

  // Используем useOptimistic для оптимистичных обновлений
  const [, addOptimisticPreferences] = useOptimistic<
    PreferencesData | null,
    PreferencesData
  >(null, (_state, newPreferences) => {
    return newPreferences;
  });

  // Используем useTransition для обработки асинхронных операций
  const [isPending, startTransition] = useTransition();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.userId) {
      newErrors.userId = t("form.validation.userIdRequired");
    }

    if (!formData.genderPreference) {
      newErrors.genderPreference = t(
        "form.validation.genderPreferenceRequired"
      );
    }

    if (!formData.minAge || formData.minAge < 18 || formData.minAge > 100) {
      newErrors.minAge = t("form.validation.minAgeRequired");
    }

    if (!formData.maxAge || formData.maxAge < 18 || formData.maxAge > 100) {
      newErrors.maxAge = t("form.validation.maxAgeRequired");
    }

    if (
      formData.minAge &&
      formData.maxAge &&
      formData.minAge > formData.maxAge
    ) {
      newErrors.maxAge = t("form.validation.ageRangeInvalid");
    }

    if (!formData.locationPreference) {
      newErrors.locationPreference = t(
        "form.validation.locationPreferenceRequired"
      );
    }

    if (
      !formData.datingGoalPreference ||
      formData.datingGoalPreference.length === 0
    ) {
      newErrors.datingGoalPreference = t(
        "form.validation.datingGoalPreferenceRequired"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Используем оптимистичное обновление при отправке формы
      addOptimisticPreferences(formData);

      // Запускаем реальный запрос в транзиции
      startTransition(async () => {
        try {
          const result = isEditMode
            ? await updatePreferencesAction(formData)
            : await createPreferencesAction(formData);

          if (result.success) {
            onSubmit(formData);
          } else {
            console.error(
              isEditMode
                ? "Ошибка обновления предпочтений:"
                : "Ошибка создания предпочтений:",
              result.error
            );
            // Здесь можно добавить обработку ошибок
          }
        } catch (error) {
          console.error(
            isEditMode
              ? "Неожиданная ошибка при обновлении предпочтений:"
              : "Неожиданная ошибка при создании предпочтений:",
            error
          );
        }
      });
    }
  };

  const handleInputChange = (name: keyof PreferencesData, value: any) => {
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

  return (
    <div className="fixed inset-0 bg-background z-40 animate-in fade-in duration-300 flex flex-col">
      {/* Заголовок */}
      <div className="flex-shrink-0 component-bg border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
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
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {isEditMode
                  ? t("preferences.editTitle")
                  : t("preferences.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? t("preferences.editSubtitle")
                  : t("preferences.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto pb-4 space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text">
            {t("preferences.setupTitle")}
          </h2>

          {/* Предпочтения по полу */}
          <div>
            <label className="block text-sm font-medium mb-3 text-foreground">
              {t("preferences.genderPreference")} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["male", "female", "any", "other"].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => handleInputChange("genderPreference", gender)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 font-medium ${
                    formData.genderPreference === gender
                      ? "border-purple-500 component-bg bg-gradient-to-r from-purple-500/10 to-purple-600/10 neon-purple-soft text-purple-600 dark:text-purple-400"
                      : "border-border component-bg hover:border-border/50 text-foreground"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        formData.genderPreference === gender
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
                      {gender === "any" && (
                        <span className="text-lg font-bold">⚧</span>
                      )}
                      {gender === "other" && (
                        <span className="text-lg font-bold">⚪</span>
                      )}
                    </div>
                    <span className="text-sm capitalize">
                      {t(`preferences.gender.${gender}`)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {errors.genderPreference && (
              <p className="text-destructive text-sm mt-2">
                {errors.genderPreference}
              </p>
            )}
          </div>

          {/* Предпочтения по возрасту */}
          <div>
            <label className="block text-sm font-medium mb-3 text-foreground">
              {t("preferences.ageRange")} *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/70">
                  {t("preferences.minAge")}
                </label>
                <input
                  type="number"
                  name="minAge"
                  value={minAgeDisplay}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMinAgeDisplay(value);

                    if (value === "") {
                      // Оставляем поле пустым для отображения, но устанавливаем значение по умолчанию в formData
                      handleInputChange("minAge", 18);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue)) {
                        handleInputChange("minAge", numValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // При потере фокуса устанавливаем минимальное значение если поле пустое
                    if (e.target.value === "") {
                      setMinAgeDisplay("18");
                      handleInputChange("minAge", 18);
                    }
                  }}
                  min="18"
                  max="100"
                  className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.minAge
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-border focus:border-border focus:ring-border/20 component-bg"
                  }`}
                />
                {errors.minAge && (
                  <p className="text-destructive text-sm mt-2">
                    {errors.minAge}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground/70">
                  {t("preferences.maxAge")}
                </label>
                <input
                  type="number"
                  name="maxAge"
                  value={maxAgeDisplay}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMaxAgeDisplay(value);

                    if (value === "") {
                      // Оставляем поле пустым для отображения, но устанавливаем значение по умолчанию в formData
                      handleInputChange("maxAge", 35);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue)) {
                        handleInputChange("maxAge", numValue);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // При потере фокуса устанавливаем минимальное значение если поле пустое
                    if (e.target.value === "") {
                      setMaxAgeDisplay("35");
                      handleInputChange("maxAge", 35);
                    }
                  }}
                  min="18"
                  max="100"
                  className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.maxAge
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-border focus:border-border focus:ring-border/20 component-bg"
                  }`}
                />
                {errors.maxAge && (
                  <p className="text-destructive text-sm mt-2">
                    {errors.maxAge}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 p-3 rounded-2xl border-2 border-border component-bg">
              <p className="text-sm text-foreground/70">
                {t("preferences.ageRange")}: {formData.minAge} -{" "}
                {formData.maxAge} {t("profile.age")}
              </p>
            </div>
          </div>

          {/* Предпочтения по локации */}
          <div>
            <label className="block text-sm font-medium mb-3 text-foreground">
              {t("preferences.locationPreference")} *
            </label>
            <div className="space-y-3">
              {PREFERRED_LOCATION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="locationPreference"
                    value={option.value}
                    checked={formData.locationPreference === option.value}
                    onChange={(e) =>
                      handleInputChange("locationPreference", e.target.value)
                    }
                    className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
                  />
                  <span className="text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.locationPreference && (
              <p className="text-destructive text-sm mt-2">
                {errors.locationPreference}
              </p>
            )}
          </div>

          {/* Максимальное расстояние - показываем только если выбрано "Поблизости" */}
          {formData.locationPreference === "NEARBY" && (
            <div>
              <label className="block text-sm font-medium mb-3 text-foreground">
                {t("preferences.maxDistance")}
              </label>
              <div className="p-4 rounded-2xl border-2 border-border component-bg">
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    name="maxDistance"
                    min="1"
                    max="100"
                    value={formData.maxDistance}
                    onChange={(e) =>
                      handleInputChange("maxDistance", parseInt(e.target.value))
                    }
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-lg font-bold text-foreground min-w-[4rem] text-center">
                    {formData.maxDistance} км
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Цель знакомств */}
          <div>
            <label className="block text-sm font-medium mb-3 text-foreground">
              {t("preferences.datingGoalPreference")} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {DATING_GOALS.map((goal) => (
                <label
                  key={goal.value}
                  className={`flex items-center p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                    formData.datingGoalPreference.includes(goal.value)
                      ? "border-purple-500 component-bg bg-gradient-to-r from-purple-500/10 to-purple-600/10 neon-purple-soft"
                      : "border-border component-bg hover:border-border/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.datingGoalPreference.includes(goal.value)}
                    onChange={() => {
                      const value = goal.value;
                      const updatedGoals =
                        formData.datingGoalPreference.includes(value)
                          ? formData.datingGoalPreference.filter(
                              (item) => item !== value
                            )
                          : [...formData.datingGoalPreference, value];
                      handleInputChange("datingGoalPreference", updatedGoals);
                    }}
                    className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
                  />
                  <span className="text-sm text-foreground">{goal.label}</span>
                </label>
              ))}
            </div>
            {errors.datingGoalPreference && (
              <p className="text-destructive text-sm mt-2">
                {errors.datingGoalPreference}
              </p>
            )}
          </div>

          {/* Предпочтения по курению */}
          <div>
            <label className="block text-sm font-medium mb-3 text-foreground">
              {t("preferences.smokingPreference")}
            </label>
            <div className="space-y-3">
              {SMOKING_PREFERENCE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="smokingPreference"
                    value={option.value}
                    checked={formData.smokingPreference === option.value}
                    onChange={(e) =>
                      handleInputChange("smokingPreference", e.target.value)
                    }
                    className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
                  />
                  <span className="text-foreground">
                    {t(`preferences.smokingPreferenceOptions.${option.value}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Предпочтения по алкоголю */}
          <div>
            <label className="block text-sm font-medium mb-3 text-foreground">
              {t("preferences.drinkingPreference")}
            </label>
            <div className="space-y-3">
              {DRINKING_PREFERENCE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="drinkingPreference"
                    value={option.value}
                    checked={formData.drinkingPreference === option.value}
                    onChange={(e) =>
                      handleInputChange("drinkingPreference", e.target.value)
                    }
                    className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
                  />
                  <span className="text-foreground">
                    {t(`preferences.drinkingPreferenceOptions.${option.value}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Фиксированная кнопка внизу */}
      <div className="flex-shrink-0 component-bg border-t border-border px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex gap-3">
            {/* Показываем кнопку отмены только в режиме редактирования */}
            {isEditMode && (
              <button
                onClick={onCancel}
                className="flex-1 px-8 py-4 rounded-xl border-border border-2 shadow-md component-bg text-foreground hover:border-red-500/50 transition-all duration-200 font-medium"
              >
                {t("form.navigation.cancel")}
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className={`px-8 py-4 rounded-xl border-border border-2 shadow-md component-bg text-foreground neon-purple-soft transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                isEditMode ? "flex-1" : "w-full"
              }`}
            >
              {isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>
                    {isEditMode
                      ? t("preferences.updating")
                      : t("preferences.saving")}
                  </span>
                </div>
              ) : (
                t("form.navigation.save")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
