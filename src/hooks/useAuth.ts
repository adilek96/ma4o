import { useEffect, useState, useCallback } from 'react'
import { useRawInitData } from "@telegram-apps/sdk-react";

type User = {
  id: string
  username?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initData = useRawInitData()

  const fetchMe = useCallback(async () => {
    console.log('fetchMe: идет проверка аксес токена')
    try {
      const res = await fetch('https://api.ma4o.com/api/v1/user/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        console.log('fetchMe: аксес токен валид, идет запись в стейт')
        console.log('fetchMe: данные пользователя', data.user)
        return true
      } else {
        setUser(null)
        return false
      }
    } catch {
      setUser(null)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async () => {
    if (!(window as any).Telegram?.WebApp) {
      console.error('Telegram WebApp not found')
      return false
    }

    try {
      console.log('login: идет попытка авторизации')
      console.log('login: initData', initData)
      const res = await fetch('https://api.ma4o.com/api/v1/auth/tg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      })

      console.log('login: ответ от сервера', res)
      if (res.ok) {
        return await fetchMe()
      } else {
        console.error('Login failed:', res.status)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }, [initData, fetchMe])

  const refresh = useCallback(async () => {
    console.log('refresh: аксес токен прострочен, идет попытка обновить')
    try {
      const res = await fetch('https://api.ma4o.com/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        return await fetchMe()
      }
    } catch (error) {
      console.error('Refresh error:', error)
    }
    
    // Если refresh не удался, пробуем login
    return await login()
  }, [fetchMe, login])

  useEffect(() => {
    (async () => {
      setLoading(true)
      const res = await fetch('https://api.ma4o.com/api/v1/user/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setLoading(false)
        return
      }
      // если токен протух → пробуем refresh
      const refreshed = await refresh()
      if (!refreshed) {
        setLoading(false)
      }
    })()
  }, [refresh, login])

  return { user, loading, login }
}
