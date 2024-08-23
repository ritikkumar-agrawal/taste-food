import { createContext, useReducer, useEffect } from 'react'

//this const will return a new context object which is stored in ThemeContext
export const ThemeContext = createContext()

//Context Provider component will wrap any part of the component tree to provide it with the value of the context
const themeReducer = (state, action) => {
  switch (action.type) {
    case 'CHANGE_COLOR':
      return { ...state, color: action.payload }
    case 'CHANGE_BUTTON_COLOR':
      return { ...state, buttonColor: action.payload }
    case 'CHANGE_BUTTON_HOVER_COLOR':
      return { ...state, buttonHoverColor: action.payload }
    case 'CHANGE_CARD_COLOR':
      return { ...state, cardColor: action.payload }
    case 'CHANGE_COMMENT_COLOR':
      return { ...state, commentColor: action.payload }
    case 'CHANGE_FOOTER_COLOR':
      return { ...state, footerColor: action.payload }
    case 'CHANGE_MODE':
      return { ...state, mode: action.payload }
    case 'INITIALIZE_THEME':
      return { ...state, mode: action.payload }
    default:
      return state
  }
}

export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, {
    color: 'linear-gradient(135deg, #ffdd87, #ff8900)',
    buttonColor: '#001e38',
    buttonHoverColor: '#001527',
    cardColor: '#ffe6b3',
    commentColor: '#FFE1C4',
    footerColor: '#ffdd87',
    mode: localStorage.getItem('mode') || 'light',
  })

  useEffect(() => {
    // Save the current theme to localStorage whenever it changes
    localStorage.setItem('mode', state.mode)
  }, [state.mode])

  const changeColor = (color) => {
    dispatch({ type: 'CHANGE_COLOR', payload: color })
  }

  const changeButtonColor = (buttonColor) => {
    dispatch({ type: 'CHANGE_BUTTON_COLOR', payload: buttonColor })
  }

  const changeButtonHoverColor = (buttonHoverColor) => {
    dispatch({ type: 'CHANGE_BUTTON_HOVER_COLOR', payload: buttonHoverColor })
  }

  const changeCardColor = (cardColor) => {
    dispatch({ type: 'CHANGE_CARD_COLOR', payload: cardColor })
  }

  const changeCommentColor = (commentColor) => {
    dispatch({ type: 'CHANGE_COMMENT_COLOR', payload: commentColor })
  }

  const changeFooterColor = (footerColor) => {
    dispatch({ type: 'CHANGE_FOOTER_COLOR', payload: footerColor })
  }

  const changeMode = (mode) => {
    dispatch({ type: 'CHANGE_MODE', payload: mode })
  }

  // Initialize the theme on mount
  const initializeTheme = () => {
    const storedMode = localStorage.getItem('mode') || 'light'
    dispatch({ type: 'INITIALIZE_THEME', payload: storedMode })
  }

  useEffect(() => {
    // Call initializeTheme when the component mounts
    initializeTheme()
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        ...state,
        changeColor,
        changeButtonColor,
        changeButtonHoverColor,
        changeCardColor,
        changeCommentColor,
        changeFooterColor,
        changeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
