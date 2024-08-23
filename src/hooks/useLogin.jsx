import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { useAuthContext } from './useAuthContext'

export const useLogin = () => {
  const [isCancelled, setIsCancelled] = useState(false)
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const { dispatch } = useAuthContext()

  const login = async (email, password) => {
    setError(null)
    setIsPending(true)

    //log the user in
    try {
      const res = await signInWithEmailAndPassword(auth, email, password)

      // update online status
      const usersCollectionRef = doc(db, 'users', res.user.uid)
      await updateDoc(usersCollectionRef, { online: true })

      // dispatch login action
      dispatch({ type: 'LOGIN', payload: res.user })

      //update state
      if (!isCancelled) {
        setIsPending(false)
        setError(null)
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError(
          'There is no user with this email address. Please sign up first.'
        )
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log(err.message)
        }
        setError('Invalid email or password. Please try again.')
      }
      setIsPending(false)
    }
  }

  useEffect(() => {
    return () => setIsCancelled(true)
  }, [])

  return { login, isPending, error }
}
