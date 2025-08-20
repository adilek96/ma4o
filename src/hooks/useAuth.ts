import { useEffect, useState } from 'react'
import { useRawInitData } from "@telegram-apps/sdk-react";

type User = {
  id: string
  username?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  let initData: string | undefined


  useEffect(() => {
    if (window.Telegram?.WebApp) {
       initData = useRawInitData() as string
      } else {
        initData = "query_id=AAEGwvBMAAAAAAbC8ExqkwRP&user=%7B%22id%22%3A1290846726%2C%22first_name%22%3A%22%D0%90%D0%B4%D1%8B%D0%BB%D1%8C%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22adilek96%22%2C%22language_code%22%3A%22ru%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F3I9-pCwjEsRtSojLhVcS_doKuhue_zjauITuDhvWK7Y.svg%22%7D&auth_date=1755600950&signature=k_X7agqcZvlbJXxVb7bYbJeUxnx0aUzA0-rBForp0HIE1-Jbyk-67TD8m99g-B7qBgnm_Ke-Km4tjxxoekI2CA&hash=2728cff3df21b50de6dc5d256ac5fc7d3f87cfcdbb7973bf12ca2b16a5259b0d"
      }
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('https://api.ma4o.com/api/v1/user/me', { 
        credentials: 'include' 
      })
      const data = await res.json()
      console.log('checkAuth: ответ от сервера', data)

      if (data.data) {
        setUser(data.data)
        setLoading(false)
      } else {
        await refresh()
      }
    } catch (error) {
      console.log('checkAuth: ошибка', error)
      await refresh()
    }
  }

  const refresh = async () => {
    try {
      const res = await fetch('https://api.ma4o.com/api/v1/auth/refresh', { 
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
        const res = await fetch('https://api.ma4o.com/api/v1/auth/tg', { 
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
      
      if (data.user) {
        setUser(data.user)
        setLoading(false)
      }
    } catch (error) {
      console.log('auth: ошибка', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log(initData)
    checkAuth()
  }, []);
 
  return { user, loading }
}
