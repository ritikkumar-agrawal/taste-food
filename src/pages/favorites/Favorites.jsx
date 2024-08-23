import { useAuthContext } from '../../hooks/useAuthContext'
import { useTheme } from '../../hooks/useTheme'
import { Container, Spinner } from 'react-bootstrap'
import RecipeList from '../../components/RecipeList'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../../context/AppContext'
import CustomButton from '../../components/CustomButton'

// styles
import './Favorites.css'

export default function Favorites() {
  const { mode, buttonColor } = useTheme()
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const { favoriteRecipes, favoritesError, setSearchTerm } = useGlobalContext()

  const handleGoHome = () => {
    setSearchTerm('')
    navigate('/')
  }

  // Filter favorite recipes based on the currently logged-in user
  const filteredFavoriteRecipes =
    favoriteRecipes &&
    favoriteRecipes.filter(
      (recipe) => recipe.addedBy && recipe.addedBy.id === user?.uid
    )

  return (
    <Container
      className="favorites-card my-4"
      data-bs-theme={mode === 'light' ? null : 'dark'}
    >
      <div className="d-flex align-items-center justify-content-center my-4">
        <CustomButton onClick={handleGoHome}>Return to Homepage</CustomButton>
      </div>
      <h2 className="fs-2 fw-bolder text-center mb-3">My Favorite Recipes</h2>
      {favoritesError && (
        <p className="fs-4 text-center">
          Error fetching favorites: {favoritesError}
        </p>
      )}
      {favoriteRecipes === null && (
        <div className="d-flex align-items-center justify-content-center">
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
            style={{
              color: mode === 'dark' ? '#fff' : buttonColor,
            }}
          />
          <span
            className="fw-bolder my-0 ms-2"
            style={{
              color: mode === 'dark' ? '#fff' : buttonColor,
            }}
          >
            Loading
          </span>
        </div>
      )}
      {filteredFavoriteRecipes && (
        <RecipeList favoriteRecipes={filteredFavoriteRecipes} />
      )}
    </Container>
  )
}
