import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext.jsx'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <AppProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AppProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
)
