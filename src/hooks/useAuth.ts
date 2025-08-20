import { useEffect, useState, useCallback } from 'react'
import { useRawInitData } from "@telegram-apps/sdk-react";

type User = {
  id: string
  username?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    console.log('fetchMe: идет проверка аксес токена')
    try {
      const res = await fetch('https://api.ma4o.com/api/v1/user/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        console.log('fetchMe: аксес токен валид, идет запись в стейт')
        console.log('fetchMe: данные пользователя', data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    console.log('refresh: аксес токен прострочен, идет попытка обновить')
    try {
      const res = await fetch('https://api.ma4o.com/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        await fetchMe()
        return true
      }
    } catch {}
    return false
  }, [fetchMe])

  const login = useCallback(async () => {
    if (!(window as any).Telegram?.WebApp) throw new Error('Telegram WebApp not found')

  
    const initData = useRawInitData();

    const res = await fetch('https://api.ma4o.com/api/v1/auth/tg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })

    if (res.ok) {
      await fetchMe()
    }
  }, [fetchMe])



  useEffect(() => {
    ;(async () => {
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
      if (!refreshed) setLoading(false)
    })()
  }, [refresh])

  return { user, loading, login }
}
