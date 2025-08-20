// Экшены для работы с профилем

export interface ProfileData {
  // Этап 1
  firstName: string;
  lastName: string;
  birthDate: string;
  country: string;
  city: string;
  location?: {
    latitude: number;
    longitude: number;
  };

  // Этап 2
  gender: "male" | "female" | "other" | "";
  seekingGender: "male" | "female" | "any" | "";
  height: number;
  interests: string[];

  // Этап 3
  bio: string;
  languages: string[];
}

export interface OptimisticProfileData extends ProfileData {
  id: string;
  isOptimistic?: boolean;
}

// Экшен для создания профиля
export async function createProfileAction(profileData: ProfileData): Promise<{ success: boolean; error?: string; profileId?: string }> {
  try {
    // Здесь будет реальный API запрос
    const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

    console.log("profileData", profileData);

    const response = await fetch(`${baseUrl}/api/v1/profile`, {
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

  // Валидация этапа 1
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
  if (!profileData.country.trim()) {
    errors.country = 'Страна обязательна для заполнения';
  }
  if (!profileData.city.trim()) {
    errors.city = 'Город обязателен для заполнения';
  }

  // Валидация этапа 2
  if (!profileData.gender) {
    errors.gender = 'Пол обязателен для заполнения';
  }
  if (profileData.height < 120 || profileData.height > 210) {
    errors.height = 'Рост должен быть от 120 до 210 см';
  }
  if (profileData.interests.length === 0) {
    errors.interests = 'Выберите хотя бы один интерес';
  }

  // Валидация этапа 3
  if (!profileData.bio.trim()) {
    errors.bio = 'Биография обязательна для заполнения';
  } else if (profileData.bio.length < 10) {
    errors.bio = 'Биография должна содержать минимум 10 символов';
  } else if (profileData.bio.length > 500) {
    errors.bio = 'Биография не должна превышать 500 символов';
  }
  if (profileData.languages.length === 0) {
    errors.languages = 'Выберите хотя бы один язык';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
