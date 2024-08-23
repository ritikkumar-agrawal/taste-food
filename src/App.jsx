import { Routes, Route, Navigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container'

// pages & components
import Navigationbar from './components/Navbar'
import Create from './pages/create/Create'
import Favorites from './pages/favorites/Favorites'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import Signup from './pages/signup/Signup'
import Recipe from './pages/recipe/Recipe'
import NotFound from './pages/notFound/notFound'
import Search from './pages/search/Search'
import Footer from './components/Footer'
import { useAuthContext } from './hooks/useAuthContext'
import { useTheme } from './hooks/useTheme'

//styles
import './App.css'

function App() {
  const { authIsReady, user } = useAuthContext()
  const { mode } = useTheme()

  return (
    <main
      className={`App ${mode === 'light' ? 'bg-light' : 'bg-dark'} text-${
        mode === 'light' ? 'dark' : 'white'
      }`}
    >
      {authIsReady && (
        <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
          <a href="#main-content" className="visually-hidden">
            Skip to main content
          </a>

          <Navigationbar />

          <Container fluid className="p-0" id="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route
                path="/create"
                element={
                  user ? <Create /> : <Navigate to="/login" replace={true} />
                }
              />
              <Route
                path="/favorites"
                element={
                  user ? <Favorites /> : <Navigate to="/login" replace={true} />
                }
              />
              <Route path="/recipes/:id" element={<Recipe />} />
              <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to="/" replace={true} />}
              />
              <Route
                path="/signup"
                element={
                  !user ? <Signup /> : <Navigate to="/" replace={true} />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>

          <Footer className="position-fixed bottom-0 w-100" />
        </div>
      )}
    </main>
  )
}

export default App
