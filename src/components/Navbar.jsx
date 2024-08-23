import {
  Container,
  Navbar,
  Nav,
  NavItem,
  Image,
  Spinner,
} from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useTheme } from '../hooks/useTheme'
import ThemeSelector from './ThemeSelector'
import ColorSelector from './ColorSelector'
import { useLogout } from '../hooks/useLogout'
import { useAuthContext } from '../hooks/useAuthContext'
import { useGlobalContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import CustomButton from './CustomButton'

//styles & images
import './Navbar.css'
import logo from '../../src/favicon.svg'
import AddLight from '../assets/add_iconLight.svg'
import AddDark from '../assets/add_iconDark.svg'
import HeartLight from '../assets/likeFilledLight.svg'
import HeartDark from '../assets/likeFilledDark.svg'

export default function Navigationbar() {
  const { logout, isPending } = useLogout()
  const { user } = useAuthContext()
  const { mode, color } = useTheme()
  const navigate = useNavigate()
  const { fetchMeals, setSearchTerm } = useGlobalContext()

  const handleLogoClick = () => {
    setSearchTerm('')
    fetchMeals()
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  const handleSignupClick = () => {
    navigate('/signup')
  }

  return (
    <Navbar
      sticky="top"
      style={{ background: color }}
      data-bs-theme={mode === 'light' ? null : 'dark'}
      expand="lg"
    >
      <Container className="nav-container">
        <LinkContainer to="/" onClick={handleLogoClick}>
          <Navbar.Brand className="d-flex align-items-center">
            <Image
              src={logo}
              className={`d-none d-sm-inline-block me-3 ${
                mode === 'dark' ? 'logo-img-dark' : 'logo-img'
              }`}
              alt="Tasty Treats logo Dish with food"
            />
            <h1 className="nav-header d-inline-block fs-3 fw-bold mb-0">
              Tasty Treats
            </h1>
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-lg-center">
            {!user && (
              <>
                <Nav.Item className="mb-2 mb-lg-0 fw-semibold">
                  <CustomButton onClick={handleLoginClick}>Login</CustomButton>
                </Nav.Item>

                <Nav.Item className="mb-2 mb-lg-0 ms-lg-3 fw-semibold">
                  <CustomButton onClick={handleSignupClick}>
                    Signup
                  </CustomButton>
                </Nav.Item>
              </>
            )}

            {user && (
              <>
                <Nav.Item className="mb-2 mb-lg-0 d-flex align-items-center">
                  <LinkContainer to="/create">
                    <Nav.Link
                      className="nav-btn-link fw-semibold"
                      aria-label="Create Recipe"
                    >
                      <Image
                        src={mode === 'light' ? AddLight : AddDark}
                        className="mr-1"
                        alt="Add icon"
                        style={{
                          height: '24px',
                          width: '24px',
                          marginRight: '8px',
                        }}
                      />
                      Create Recipe
                    </Nav.Link>
                  </LinkContainer>
                </Nav.Item>

                <Nav.Item className="mb-2 mb-lg-0 d-flex align-items-center">
                  <LinkContainer to="/favorites">
                    <Nav.Link
                      className="nav-btn-link fw-semibold"
                      aria-label="Favorites"
                    >
                      <Image
                        src={mode === 'light' ? HeartLight : HeartDark}
                        className="mr-1"
                        alt="Favorites heart icon"
                        style={{
                          height: '24px',
                          width: '24px',
                          marginRight: '8px',
                        }}
                      />
                      Favorites
                    </Nav.Link>
                  </LinkContainer>
                </Nav.Item>

                <Nav.Item className="mb-2 mb-lg-0 ms-lg-3">
                  <CustomButton disabled={isPending} onClick={logout}>
                    {isPending && (
                      <Spinner
                        as="span"
                        animation="grow"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                    )}
                    {isPending ? 'Logging out' : 'Logout'}
                  </CustomButton>
                </Nav.Item>
              </>
            )}

            <NavItem className="align-items-lg-center">
              <div className="d-flex align-items-center ms-lg-3">
                <ThemeSelector />
                <ColorSelector />
              </div>
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
