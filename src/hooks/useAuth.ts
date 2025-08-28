import { useEffect, useState } from 'react'

type User = {
  id: string
  telegramId: number
  username: string
  firstName: string
  lastName: string
  email: string | null
  isNew: boolean
  isPreferences: boolean
  createdAt: string
  updatedAt: string
  profile?: {
    id: string
    userId: string
    gender: string
    birthDate: string
    height: number
    country: string
    city: string
    latitude: number
    longitude: number
    interests: string[]
    languages: string[]
    bio: string
    smoking?: string
    drinking?: string
    education?: string
    occupation?: string
    isActive: boolean
    isVerified: boolean
    createdAt: string
    updatedAt: string
  }
  preferences?: {
    id: string
    userId: string
    genderPreference: string
    minAge: number
    maxAge: number
    locationPreference: string
    maxDistance: number
    datingGoalPreference: string
    smokingPreference?: string
    drinkingPreference?: string
    createdAt: string
    updatedAt: string
  }
  photos?: {
    id: string
    userId: string
    url: string
    isMain?: boolean
    createdAt: string
    updatedAt: string
  }[]
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initData, setInitData] = useState<string | null>(null)

  const aplication = import.meta.env.VITE_APPLICATION;
  const initDataDev = import.meta.env.VITE_INIT_DATA_DEV;
  const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
  const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
  const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

  // Определяем initData на основе окружения
  useEffect(() => {
    if (aplication === "production") {
      // В продакшене берем initData из Telegram WebApp
      if (window.Telegram?.WebApp?.initData) {
        setInitData(window.Telegram.WebApp.initData);
      } else {
        setInitData(null);
      }
    } else {
      // В режиме разработки берем initData из переменной окружения
      setInitData(initDataDev || null);
    }
  }, [aplication, initDataDev]);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/user/me`, { 
        credentials: 'include'
      })
      const data = await res.json()

      if (data.data) {
        setUser(data.data)
        setLoading(false)
      } else {
        if(data.error === "Unauthorized" ) {
            await refresh()
        } else {
          await auth()
        }
      }
    } catch (error) {
      // В режиме разработки создаем мокового пользователя, если API недоступен
      if (aplication !== "production") {
        console.log("API недоступен в режиме разработки, создаем мокового пользователя");
        const mockUser: User = {
          id: "dev-user-id",
          telegramId: 123456789,
          username: "test_user",
          firstName: "Тестовый",
          lastName: "Пользователь",
          email: null,
          isNew: true, // Новый пользователь для показа форм настройки
          isPreferences: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setLoading(false);
        return;
      }
      await refresh()
    }
  }

  const refresh = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, { 
        method: 'POST',
        credentials: 'include'
      })
      
      if (res.ok) {
        // Если refresh успешен, проверяем снова
        await checkAuth()
      } else {
        await auth()
      }
    } catch (error) {
      // В режиме разработки создаем мокового пользователя, если API недоступен
      if (aplication !== "production") {
        console.log("API недоступен в режиме разработки, создаем мокового пользователя");
        const mockUser: User = {
          id: "dev-user-id",
          telegramId: 123456789,
          username: "test_user",
          firstName: "Тестовый",
          lastName: "Пользователь",
          email: null,
          isNew: true,
          isPreferences: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setLoading(false);
        return;
      }
      await auth()
    }
  }

  const auth = async () => {
    try {
      // Проверяем, есть ли данные для аутентификации
      if (!initData) {
        // В режиме разработки создаем мокового пользователя, если нет initData
        if (aplication !== "production") {
          console.log("Нет initData в режиме разработки, создаем мокового пользователя");
          const mockUser: User = {
            id: "dev-user-id",
            telegramId: 123456789,
            username: "test_user",
            firstName: "Тестовый",
            lastName: "Пользователь",
            email: null,
            isNew: true,
            isPreferences: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(mockUser);
          setLoading(false);
          return;
        }
        setLoading(false)
        return
      }

      const res = await fetch(`${baseUrl}/api/v1/auth/tg`, { 
          method: 'POST', 
          headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          }, 
          body: JSON.stringify({ initData }),
          credentials: 'include'
      })
      const data = await res.json()
      
      if (data.message === "success") {
        await checkAuth()
      } else {
        setLoading(false)
      }
    } catch (error) {
      // В режиме разработки создаем мокового пользователя, если API недоступен
      if (aplication !== "production") {
        console.log("API недоступен в режиме разработки, создаем мокового пользователя");
        const mockUser: User = {
          id: "dev-user-id",
          telegramId: 123456789,
          username: "test_user",
          firstName: "Тестовый",
          lastName: "Пользователь",
          email: null,
          isNew: true,
          isPreferences: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(mockUser);
        setLoading(false);
        return;
      }
      setLoading(false)
    }
  }

  const refreshUserData = async () => {
    try {
      // В режиме разработки делаем реальный API запрос
      if (aplication !== "production") {
        console.log("Режим разработки: обновляем данные пользователя через API");
        await checkAuth();
        return;
      }
      
      await checkAuth()
    } catch (error) {
      // Ошибка обновления данных пользователя
      console.error("Ошибка при обновлении данных пользователя:", error);
    }
  }

  useEffect(() => {
    // Добавляем небольшую задержку для инициализации Telegram WebApp
    const timer = setTimeout(() => {
      checkAuth()
    }, 100);
    
    return () => clearTimeout(timer)
  }, [initData]); // Добавляем initData в зависимости
 
  return { user, loading, refreshUserData }
}
