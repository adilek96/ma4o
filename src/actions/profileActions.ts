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

// Экшен для обновления профиля
export async function updateProfileAction(profileId: string, profileData: Partial<ProfileData>): Promise<{ success: boolean; error?: string }> {
  try {
    const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

    const response = await fetch(`${baseUrl}/api/v1/profile/${profileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка при обновлении профиля');
    }
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
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

  // Валидация этапа 1: Основная информация
  if (!profileData.firstName.trim()) {
    errors.firstName = 'Имя обязательно для заполнения';
  }
  if (!profileData.lastName.trim()) {
    errors.lastName = 'Фамилия обязательна для заполнения';
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
  if (!profileData.gender) {
    errors.gender = 'Пол обязателен для заполнения';
  }
  if (profileData.height < 120 || profileData.height > 210) {
    errors.height = 'Рост должен быть от 120 до 210 см';
  }

  // Валидация этапа 2: Локация
  if (!profileData.country.trim()) {
    errors.country = 'Страна обязательна для заполнения';
  }
  if (!profileData.city.trim()) {
    errors.city = 'Город обязателен для заполнения';
  }
  if (!profileData.preferredLocation) {
    errors.preferredLocation = 'Предпочитаемая локация обязательна для заполнения';
  }

  // Валидация этапа 3: Предпочтения
  if (!profileData.seekingGender) {
    errors.seekingGender = 'Предпочитаемый пол обязателен для заполнения';
  }
  if (!profileData.datingGoal) {
    errors.datingGoal = 'Цель знакомства обязательна для заполнения';
  }
  if (!profileData.minAge || profileData.minAge < 18 || profileData.minAge > 100) {
    errors.minAge = 'Минимальный возраст должен быть от 18 до 100 лет';
  }
  if (!profileData.maxAge || profileData.maxAge < 18 || profileData.maxAge > 100) {
    errors.maxAge = 'Максимальный возраст должен быть от 18 до 100 лет';
  }
  if (profileData.minAge && profileData.maxAge && profileData.minAge > profileData.maxAge) {
    errors.maxAge = 'Минимальный возраст не может быть больше максимального';
  }
  if (profileData.interests.length === 0) {
    errors.interests = 'Выберите хотя бы один интерес';
  }
  if (profileData.languages.length === 0) {
    errors.languages = 'Выберите хотя бы один язык';
  }

  // Валидация этапа 4: Дополнительная информация
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
