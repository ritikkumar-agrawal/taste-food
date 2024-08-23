import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { useAuthContext } from './useAuthContext'

export const useLogout = () => {
  const [isCancelled, setIsCancelled] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { dispatch, user } = useAuthContext()

  const logout = async () => {
    setError(null)
    setIsPending(true)

    // sign the user out
    try {
      // update online status
      const { uid } = user
      const usersCollectionRef = doc(db, 'users', uid)
      await updateDoc(usersCollectionRef, { online: false })

      await signOut(auth)

      // dispatch logout action
      dispatch({ type: 'LOGOUT' })

      // update state
      if (!isCancelled) {
        setIsPending(false)
        setError(null)
      }
    } catch (err) {
      if (!isCancelled) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(err.message)
        }
        setError(err.message)
        setIsPending(false)
      }
    }
  }

  useEffect(() => {
    setIsCancelled(false)
    return () => setIsCancelled(true)
  }, [])

  return { logout, error, isPending }
}
