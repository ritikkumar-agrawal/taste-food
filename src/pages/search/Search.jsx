import { useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { Spinner, Container } from 'react-bootstrap'
import RecipeList from '../../components/RecipeList'
import { useGlobalContext } from '../../context/AppContext'
import CustomButton from '../../components/CustomButton'
import axios from 'axios'

// Styles
// import './Search.css'

export default function Search() {
  const queryString = useLocation().search
  const queryParams = new URLSearchParams(queryString)
  const query2 = queryParams.get('q')
  const { mode, buttonColor } = useTheme()
  const { allMealsURL, selectMeal, setSearchTerm } = useGlobalContext()
  const navigate = useNavigate()

  const [recipes, setRecipes] = useState(null)
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load search term and recipes from local storage on initial render
  useEffect(() => {
    const storedSearchTerm = localStorage.getItem('searchTerm')
    const storedRecipes = JSON.parse(localStorage.getItem('recipes'))
    // Set the search term from local storage
    setSearchTerm(storedSearchTerm || '')
    // Set the recipes from local storage
    setRecipes(storedRecipes || null)
  }, [setSearchTerm])

  // Update local storage whenever the search term changes
  useEffect(() => {
    // Store the search term in local storage
    localStorage.setItem('searchTerm', query2 || '')
  }, [query2])

  // Update local storage whenever the recipes change
  useEffect(() => {
    // Store the recipes in local storage
    localStorage.setItem('recipes', JSON.stringify(recipes))
  }, [recipes])

  useEffect(() => {
    setIsLoading(true)

    const fetchData = async () => {
      try {
        if (!query2) {
          setRecipes([])
          setError(false)
        } else {
          // Firestore Query
          const firestoreSnapshotPromise = getDocs(collection(db, 'recipes'))
          const apiResultsPromise = axios.get(allMealsURL + query2)

          const [firestoreSnapshot, apiResultsResponse] = await Promise.all([
            firestoreSnapshotPromise,
            apiResultsPromise,
          ])

          const firestoreResults = firestoreSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((recipe) =>
              recipe.title.toLowerCase().includes(query2.toLowerCase())
            )

          const apiResultsData = apiResultsResponse.data.meals || []
          const apiResults = apiResultsData.map((meal) => ({
            id: meal.idMeal,
            title: meal.strMeal,
            imageURL: meal.strMealThumb,
          }))

          const combinedResults = [...firestoreResults, ...apiResults]

          if (combinedResults.length === 0) {
            setError('No recipes found matching your search criteria.')
            setRecipes([])
          } else {
            // Sort the combined results
            const sortedResults = combinedResults.sort((a, b) =>
              a.title.localeCompare(b.title)
            )
            setRecipes(sortedResults)
            setError(false)
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(error)
        }
        setError('Error occurred while fetching data.')
        setRecipes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [query2])

  const handleGoToHomepage = () => {
    // Clear the search term
    setSearchTerm('')
    // Navigate to the homepage route
    navigate('/')
  }

  return (
    <Container
      className="mb-4"
      data-bs-theme={mode === 'light' ? null : 'dark'}
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <div className="d-flex align-items-center justify-content-center my-4">
        <CustomButton onClick={handleGoToHomepage}>
          Return to Homepage
        </CustomButton>
      </div>
      <h2 className="fs-2 fw-bolder text-center mb-3 page-title">
        Search results for "{query2}"
      </h2>
      {error && <p className="fs-4 text-center">{error}</p>}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center mt-5">
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
      ) : (
        recipes && (
          <RecipeList recipes={recipes} selectMeal={selectMeal} error={error} />
        )
      )}
    </Container>
  )
}
