import { useState, useEffect } from 'react'
import { getUserByUserId } from '../services/firebase'
import { IUser } from '../types'

export default function useUser(uId: string) {
  const [activeUser, setActiveUser] = useState<IUser | undefined>()

  useEffect(() => {
    async function getUserObjByUserId(uId: string) {
      const user = await getUserByUserId(uId)
      setActiveUser(user)
    }

    if (uId) {
      getUserObjByUserId(uId)
    }
  }, [uId])

  return { user: activeUser, setActiveUser }
}
