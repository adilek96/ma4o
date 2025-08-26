// Экшены для работы с предпочтениями пользователя
import type { PreferencesData } from '../types/profile';
import { DATING_GOALS, SMOKING_OPTIONS, DRINKING_OPTIONS, PREFERRED_LOCATION_OPTIONS } from '../types/profile';

export type { PreferencesData };
export { DATING_GOALS, SMOKING_OPTIONS, DRINKING_OPTIONS, PREFERRED_LOCATION_OPTIONS };

// Экшен для создания предпочтений
export async function createPreferencesAction(preferencesData: PreferencesData): Promise<{ success: boolean; error?: string; preferencesId?: string }> {
  try {
    const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

    console.log("preferencesData", preferencesData);

    const response = await fetch(`${baseUrl}/api/v1/user/preferences/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(preferencesData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при создании предпочтений');
    }

    const data = await response.json();
    
    return {
      success: true,
      preferencesId: data.preferencesId,
    };
  } catch (error) {
    console.error('Ошибка при создании предпочтений:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}



// Экшен для получения предпочтений пользователя
export async function getPreferencesAction(userId: string): Promise<{ success: boolean; error?: string; preferences?: PreferencesData }> {
  try {
    const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

    const response = await fetch(`${baseUrl}/api/v1/user/preferences/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при получении предпочтений');
    }

    const data = await response.json();
    
    return {
      success: true,
      preferences: data.preferences,
    };
  } catch (error) {
    console.error('Ошибка при получении предпочтений:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

// Экшен для валидации данных предпочтений
export async function validatePreferencesData(preferencesData: PreferencesData): Promise<{ isValid: boolean; errors: Record<string, string> }> {
  const errors: Record<string, string> = {};

  // Валидация userId
  if (!preferencesData.userId) {
    errors.userId = 'ID пользователя обязателен';
  }

  // Валидация предпочтений
  if (!preferencesData.genderPreference) {
    errors.genderPreference = 'Предпочитаемый пол обязателен для заполнения';
  }
  if (!preferencesData.minAge || preferencesData.minAge < 18 || preferencesData.minAge > 100) {
    errors.minAge = 'Минимальный возраст должен быть от 18 до 100 лет';
  }
  if (!preferencesData.maxAge || preferencesData.maxAge < 18 || preferencesData.maxAge > 100) {
    errors.maxAge = 'Максимальный возраст должен быть от 18 до 100 лет';
  }
  if (preferencesData.minAge && preferencesData.maxAge && preferencesData.minAge > preferencesData.maxAge) {
    errors.maxAge = 'Минимальный возраст не может быть больше максимального';
  }
  if (!preferencesData.locationPreference) {
    errors.locationPreference = 'Предпочитаемая локация обязательна для заполнения';
  }
  if (!preferencesData.datingGoalPreference || preferencesData.datingGoalPreference.length === 0) {
    errors.datingGoalPreference = 'Цель знакомства обязательна для заполнения';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
