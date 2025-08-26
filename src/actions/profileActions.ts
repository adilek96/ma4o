// Экшены для работы с профилем
import type { ProfileData, OptimisticProfileData, DatingGoal, SmokingStatus, DrinkingStatus, PreferredLocation, Education, Occupation } from '../types/profile';
import { DATING_GOALS, SMOKING_OPTIONS, DRINKING_OPTIONS, PREFERRED_LOCATION_OPTIONS, EDUCATION_OPTIONS, OCCUPATION_OPTIONS } from '../types/profile';

export type { DatingGoal, ProfileData, OptimisticProfileData, SmokingStatus, DrinkingStatus, PreferredLocation, Education, Occupation };
export { DATING_GOALS, SMOKING_OPTIONS, DRINKING_OPTIONS, PREFERRED_LOCATION_OPTIONS, EDUCATION_OPTIONS, OCCUPATION_OPTIONS };

// Экшен для создания профиля
export async function createProfileAction(profileData: ProfileData): Promise<{ success: boolean; error?: string; profileId?: string }> {
  try {
    // Здесь будет реальный API запрос
    const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

    console.log("profileData", profileData);

    const response = await fetch(`${baseUrl}/api/v1/user/profile/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при создании профиля');
    }

    const data = await response.json();
    
    return {
      success: true,
      profileId: data.profileId,
    };
  } catch (error) {
    console.error('Ошибка при создании профиля:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}


// Экшен для валидации данных профиля
export async function validateProfileData(profileData: ProfileData): Promise<{ isValid: boolean; errors: Record<string, string> }> {
  const errors: Record<string, string> = {};

  // Валидация userId
  if (!profileData.userId) {
    errors.userId = 'ID пользователя обязателен';
  }

  // Валидация основной информации
  if (!profileData.gender) {
    errors.gender = 'Пол обязателен для заполнения';
  }
  if (!profileData.birthDate) {
    errors.birthDate = 'Дата рождения обязательна';
  } else {
    const birthDate = new Date(profileData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      errors.birthDate = 'Возраст должен быть не менее 18 лет';
    }
  }
  if (profileData.height < 120 || profileData.height > 210) {
    errors.height = 'Рост должен быть от 120 до 210 см';
  }

  // Валидация локации
  if (!profileData.country.trim()) {
    errors.country = 'Страна обязательна для заполнения';
  }
  if (!profileData.city.trim()) {
    errors.city = 'Город обязателен для заполнения';
  }

  // Валидация дополнительной информации
  if (profileData.interests.length === 0) {
    errors.interests = 'Выберите хотя бы один интерес';
  }
  if (profileData.languages.length === 0) {
    errors.languages = 'Выберите хотя бы один язык';
  }
  if (!profileData.bio.trim()) {
    errors.bio = 'Биография обязательна для заполнения';
  } else if (profileData.bio.length < 10) {
    errors.bio = 'Биография должна содержать минимум 10 символов';
  } else if (profileData.bio.length > 500) {
    errors.bio = 'Биография не должна превышать 500 символов';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}


