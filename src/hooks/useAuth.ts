import { useEffect, useState } from 'react'
import { useRawInitData } from "@telegram-apps/sdk-react";

type User = {
  id: string
  username?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initData = useRawInitData()


  const checkAuth = async () => {
   try {
    const res = await fetch('https://api.ma4o.com/api/v1/user/me', { credentials: 'include' })
    const data = await res.json()
    console.log('checkAuth: ответ от сервера', data)

    if (data.user) {
        setUser(data.user)
        setLoading(false)
    } else {
        await refresh()
    }
   } catch (error) {
    return console.log('checkAuth: ошибка', error)
   }
    
  }

  const refresh = async () => {
    try {
        const res = await fetch('https://api.ma4o.com/api/v1/auth/refresh', { method: 'POST', credentials: 'include' })
        const data = await res.json()
        console.log('refresh: ответ от сервера', data)
        if (data.user) {
            setUser(data.user)
            setLoading(false)
        } else {
            await auth()
        }
    } catch (error) {
        return console.log('refresh: ошибка', error)
    }
  }

  const auth = async () => {
    try {
        const res = await fetch('https://api.ma4o.com/api/v1/auth/tg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initData }), credentials: 'include' })
        const data = await res.json()
        console.log('auth: ответ от сервера', data)
        setUser(data.user)
        setLoading(false)
    } catch (error) {
        return console.log('auth: ошибка', error)
    }
  }

  useEffect(() => {
    checkAuth()
  }, []);
 
  
  return { user, loading }
  }                     
