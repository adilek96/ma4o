import { useEffect, useState } from 'react'
import { useRawInitData } from "@telegram-apps/sdk-react";

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

  // Получаем данные Telegram только в продакшене
  const rawInitData = useRawInitData();
  
  // Определяем initData на основе окружения
  const updateInitData = () => {
    if (aplication === "production") {
      // В продакшене используем только реальные данные Telegram
      if (window.Telegram?.WebApp?.initData) {
        setInitData(window.Telegram.WebApp.initData);
        return;
      }
      if (rawInitData) {
        setInitData(rawInitData as string);
        return;
      }
      // Если нет данных Telegram, возвращаем null
      setInitData(null);
    } else {
      // В разработке используем dev данные
      setInitData(initDataDev);
    }
  };

  // Обновляем initData при изменении rawInitData или window.Telegram
  useEffect(() => {
    updateInitData();
    
    // Добавляем небольшую задержку для инициализации Telegram WebApp
    const timer = setTimeout(() => {
      updateInitData();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [rawInitData, aplication]);

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
      await auth()
    }
  }

  const auth = async () => {
    try {
      // Проверяем, есть ли данные для аутентификации
      if (!initData) {
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
      setLoading(false)
    }
  }

  const refreshUserData = async () => {
    try {
      await checkAuth()
    } catch (error) {
      // Ошибка обновления данных пользователя
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
