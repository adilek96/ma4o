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


  const aplication = import.meta.env.VITE_APPLICATION;
  const initDataDev = import.meta.env.VITE_INIT_DATA_DEV;
  const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
  const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
  const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;




  // Перемещаем вызов хука на верхний уровень
  const rawInitData = window.Telegram?.WebApp && aplication === "production" ? useRawInitData() : initDataDev
  
  // Определяем initData на основе доступности Telegram WebApp
  const initData = window.Telegram?.WebApp && aplication === "production"
    ? rawInitData as string
    : initDataDev 


  const checkAuth = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/user/me`, { 
        credentials: 'include'
      })
      const data = await res.json()
      console.log('checkAuth: ответ от сервера', data)

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
      console.log('checkAuth: ошибка', error)
      await refresh()
    }
  }

  const refresh = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, { 
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      console.log('refresh: ответ от сервера', data)
      
      if (res.ok) {
        // Если refresh успешен, проверяем снова
        await checkAuth()
      } else {
        await auth()
      }
    } catch (error) {
      console.log('refresh: ошибка', error)
      await auth()
    }
  }

  const auth = async () => {
    try {
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
      console.log('auth: ответ от сервера', data)
      
      if (data.message === "success") {
        await checkAuth()
      }
    } catch (error) {
      console.log('auth: ошибка', error)
      setLoading(false)
    }
  }

  const refreshUserData = async () => {
    try {
      console.log('refreshUserData: начинаем обновление данных пользователя')
      await checkAuth()
      console.log('refreshUserData: данные пользователя обновлены', user)
    } catch (error) {
      console.log('refreshUserData: ошибка', error)
    }
  }

  useEffect(() => {
  
    checkAuth()
  }, [initData]); // Добавляем initData в зависимости
 
  return { user, loading, refreshUserData }
}
