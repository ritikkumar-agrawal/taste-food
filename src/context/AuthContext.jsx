// DONE ---------------->>>
// (React hooks)
import { createContext, useReducer, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'

// provides the authentication state without passing props manually to every child class & pages
export const AuthContext = createContext()

// handles the 3 states of auth 
// action includes the type of any relevant data
export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      // update sthe state with the user's info
      return { ...state, user: action.payload }
    case 'LOGOUT':
      // user data to NULL
      return { ...state, user: null }
    case 'AUTH_IS_READY':
      // initialising auth
      return { ...state, user: action.payload, authIsReady: true }
    default:
      return state
  }
}

export const AuthContextProvider = ({ children }) => {

  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    authIsReady: false,
  })

  useEffect(() => {
    // onAuthStateChanged is default from firebase
    const unsub = onAuthStateChanged(auth, (user) => {
      dispatch({ type: 'AUTH_IS_READY', payload: user })
      unsub()
    })
  }, [])

  if (process.env.NODE_ENV !== 'production') {
    console.log('AuthContext state:', state)
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )

}
