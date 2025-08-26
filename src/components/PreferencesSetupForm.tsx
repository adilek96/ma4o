import { useState, useOptimistic, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  createPreferencesAction,
  type PreferencesData,
  DATING_GOALS,
  SMOKING_OPTIONS,
  DRINKING_OPTIONS,
  PREFERRED_LOCATION_OPTIONS,
} from "../actions/preferencesActions";

interface PreferencesSetupFormProps {
  onSubmit: (data: PreferencesData) => void;
  onCancel: () => void;
  userId: string;
}

export default function PreferencesSetupForm({
  onSubmit,
  userId,
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

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
          const result = await createPreferencesAction(formData);
          if (result.success) {
            onSubmit(formData);
          } else {
            console.error("Ошибка создания предпочтений:", result.error);
          }
        } catch (error) {
          console.error("Неожиданная ошибка при создании предпочтений:", error);
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
              onClick={() => onSubmit(formData)}
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
                {t("preferences.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("preferences.subtitle")}
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
            <div className="space-y-3">
              {["male", "female", "any"].map((gender) => (
                <label
                  key={gender}
                  className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="genderPreference"
                    value={gender}
                    checked={formData.genderPreference === gender}
                    onChange={(e) =>
                      handleInputChange("genderPreference", e.target.value)
                    }
                    className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
                  />
                  <span className="capitalize text-foreground">
                    {t(`preferences.gender.${gender}`)}
                  </span>
                </label>
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
                  value={formData.minAge}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleInputChange("minAge", 18);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue)) {
                        handleInputChange("minAge", numValue);
                      }
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
                  value={formData.maxAge}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      handleInputChange("maxAge", 35);
                    } else {
                      const numValue = parseInt(value);
                      if (!isNaN(numValue)) {
                        handleInputChange("maxAge", numValue);
                      }
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
            <div className="space-y-3">
              {DATING_GOALS.map((goal) => (
                <label
                  key={goal.value}
                  className="flex items-center p-3 rounded-2xl border-2 border-border component-bg hover:border-border/50 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="datingGoalPreference"
                    value={goal.value}
                    checked={formData.datingGoalPreference.includes(goal.value)}
                    onChange={(e) => {
                      const value = goal.value;
                      if (e.target.checked) {
                        handleInputChange("datingGoalPreference", [
                          ...formData.datingGoalPreference,
                          value,
                        ]);
                      } else {
                        handleInputChange(
                          "datingGoalPreference",
                          formData.datingGoalPreference.filter(
                            (item) => item !== value
                          )
                        );
                      }
                    }}
                    className="mr-3 w-4 h-4 text-purple-500 focus:ring-purple-500/20"
                  />
                  <span className="text-foreground">{goal.label}</span>
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
              {SMOKING_OPTIONS.map((option) => (
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
                  <span className="text-foreground">{option.label}</span>
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
              {DRINKING_OPTIONS.map((option) => (
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
                  <span className="text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Фиксированная кнопка внизу */}
      <div className="flex-shrink-0 component-bg border-t border-border px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full px-8 py-4 rounded-xl border-border border-2 shadow-md component-bg text-foreground neon-purple-soft transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>{t("preferences.saving")}</span>
              </div>
            ) : (
              t("preferences.save")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
