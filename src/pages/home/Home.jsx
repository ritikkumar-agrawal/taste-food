import { useGlobalContext } from '../../context/AppContext'
import { useCollection } from '../../hooks/useCollection'
import { useTheme } from '../../hooks/useTheme'
import { useAuthContext } from '../../hooks/useAuthContext'
import { Greeting } from '../../components/Greeting'
import Avatar from '../../components/Avatar'
import RecipeList from '../../components/RecipeList'
import SearchBar from '../../components/SearchBar'
import { Container, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import CustomButton from '../../components/CustomButton'

// styles
import './Home.css'

export default function Home() {
  const { mode } = useTheme()
  const { user } = useAuthContext()
  const { greeting, mealType } = Greeting()
  const { documents, error } = useCollection('recipes')
  const navigate = useNavigate()

  const {
    loading: mealsLoading,
    meals,
    selectMeal,
    randomRecipe,
    displayRandomRecipe,
    setDisplayRandomRecipe,
  } = useGlobalContext()

  const handleGoHome = () => {
    setDisplayRandomRecipe(false)
    navigate('/')
  }

  return (
    <Container
      data-bs-theme={mode === 'light' ? null : 'dark'}
      className="my-4 home-container"
    >
      <Row className="align-items-start mb-4">
        {/* Left Column */}
        <Col xs={12} lg={6} xxl={6}>
          <div className="d-flex align-items-center">
            <Avatar
              src={
                user?.photoURL ||
                'https://firebasestorage.googleapis.com/v0/b/tasty-treats-site.appspot.com/o/thumbnails%2Fdefault%2FnoAvatar.png?alt=media&token=7525b0ff-7ae7-4435-a5f1-6fdf2f8dc67a'
              }
              size={50}
              padding={false}
            />
            <div className="ms-2">
              <p className="fs-4">
                {greeting} <strong>{user?.displayName || 'Guest'}</strong>!{' '}
              </p>
              <p className="fs-5">
                It's time for{' '}
                {mealType ? <strong>{mealType}</strong> : 'a delicious meal'}.
                Ready to cook?
              </p>
            </div>
          </div>
        </Col>
        {/* Right Column */}
        <Col xs={12} lg={6} xxl={6} className="my-auto">
          <SearchBar />
        </Col>
      </Row>

      <div className="d-flex justify-content-center my-4">
        {displayRandomRecipe && (
          <CustomButton onClick={handleGoHome}>Return to Homepage</CustomButton>
        )}
      </div>

      {documents && meals && (
        <Row>
          <Col>
            <RecipeList
              recipes={documents}
              meals={meals}
              mealsLoading={mealsLoading}
              selectMeal={selectMeal}
              randomRecipe={randomRecipe}
              displayRandomRecipe={displayRandomRecipe}
            />
          </Col>
        </Row>
      )}
    </Container>
  )
}
