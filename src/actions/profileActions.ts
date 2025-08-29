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
export async function updateProfileAction(profileData: ProfileData): Promise<{ success: boolean; error?: string; profileId?: string }> {
  console.log("profileData for update", profileData);
  try {
    // Здесь будет реальный API запрос
    const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

    console.log("profileData for update", profileData);

    const response = await fetch(`${baseUrl}/api/v1/user/profile/update`, {
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

    const data = await response.json();
    
    return {
      success: true,
      profileId: data.profileId,
    };
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}