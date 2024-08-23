import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useCollection } from '../hooks/useCollection'
import { useAuthContext } from '../hooks/useAuthContext'
import { useFirestore } from '../hooks/useFirestore'

export const AppContext = createContext()

const allMealsURL = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
const randomMealURL = 'https://www.themealdb.com/api/json/v1/1/random.php'

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [meals, setMeals] = useState([])
  const [randomRecipe, setRandomRecipe] = useState(null)
  const [displayRandomRecipe, setDisplayRandomRecipe] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMeal, setSelectedMeal] = useState(null)
  const { user } = useAuthContext()
  const { documents: firestoreRecipes } = useCollection('recipes')
  const { documents: favoriteRecipes, error: favoritesError } = useCollection(
    'favorites',
    user ? [['addedBy.id', '==', user.uid]] : null
  )
  const [favoriteMeal, setFavoriteMeal] = useState(null)
  const { addDocument, deleteDocument } = useFirestore('favorites')

  const fetchMeals = async (url) => {
    setLoading(true)
    try {
      const { data } = await axios.get(url)
      // console.log('API Response:', data)
      if (data.meals) {
        setMeals(data.meals)
      } else {
        setMeals([])
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error.response)
      }
    }
    setLoading(false)
  }

  const fetchRandomMeal = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(randomMealURL)
      if (data.meals) {
        setRandomRecipe(data.meals[0])
        setDisplayRandomRecipe(true)
      } else {
        setRandomRecipe(null)
        setDisplayRandomRecipe(false)
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(error.response)
      }
    }
    setLoading(false)
  }

  const selectMeal = (idMeal) => {
    // console.log('Selecting meal with ID:', idMeal)

    // Check if meals is empty or null
    if (!meals || meals.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Meals data is not available.')
      }
      return
    }

    let meal

    // Check if the meal is from the API data
    if (meals && meals.length > 0) {
      meal = meals.find((m) => m.idMeal === idMeal)
    }

    // Check if the meal is from the Firestore documents
    if (!meal && firestoreRecipes && firestoreRecipes.length > 0) {
      meal = firestoreRecipes.find((recipe) => recipe.id === idMeal)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Meal from Firestore documents:', meal)
      }
    }

    // Check if the meal is from the random recipe
    if (!meal && randomRecipe && randomRecipe.idMeal === idMeal) {
      meal = randomRecipe
    }

    // Check if the meal is from the favorite documents
    if (!meal && favoriteRecipes && favoriteRecipes.length > 0) {
      meal = favoriteRecipes.find((recipe) => recipe.idMeal === idMeal)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Meal from favorite recipes:', meal)
      }
    }

    if (meal) {
      setSelectedMeal(meal)
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Meal with ID ${idMeal} not found.`)
      }
    }
  }

  const fetchRecipeDetails = async (recipeId) => {
    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
      )
      return response.data.meals[0]
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching recipe details:', error)
      }
      return null
    }
  }

  const toggleFavorite = async (docRef, recipeId) => {
    // console.log('Recipe ID:', recipeId)

    try {
      const existingFavorite = favoriteRecipes.find(
        (fav) => fav.idMeal === recipeId && fav.addedBy?.id === user?.uid
      )

      // console.log('Favorite Recipes:', favoriteRecipes)
      // console.log('Existing Favorite:', existingFavorite)

      if (existingFavorite) {
        try {
          // Get the document ID before deleting
          await deleteDocument(docRef, { id: existingFavorite.id })
          // console.log('Deleting document with ID:', existingFavorite.id)
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error deleting document:', error)
          }
        }
      } else {
        // Recipe is not in favorites, so add it
        let fullRecipeDetails

        // Check if the recipe is in the meals state or firestoreRecipes state
        const apiRecipe = meals.find((meal) => meal.idMeal === recipeId)
        const firestoreRecipe = firestoreRecipes.find(
          (recipe) => recipe.id === recipeId
        )

        // Use the recipe details directly if found, otherwise fetch details
        fullRecipeDetails =
          apiRecipe || firestoreRecipe || (await fetchRecipeDetails(recipeId))

        if (fullRecipeDetails) {
          // Use either 'id' or 'idMeal' as the document ID
          const documentId = fullRecipeDetails.id || fullRecipeDetails.idMeal

          // console.log('Adding favorite document:', documentId)
          await addDocument({
            ...fullRecipeDetails,
            addedBy: {
              id: user.uid,
              name: user.displayName,
            },
            idMeal: documentId,
          })
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error toggling favorite:', error)
      }
    }
  }

  useEffect(() => {
    if (!searchTerm) {
      fetchMeals(allMealsURL)
    } else {
      fetchMeals(`${allMealsURL}${searchTerm}`)
    }
  }, [searchTerm])

  return (
    <AppContext.Provider
      value={{
        allMealsURL,
        loading,
        meals,
        searchTerm,
        setSearchTerm,
        fetchRandomMeal,
        randomRecipe,
        setRandomRecipe,
        displayRandomRecipe,
        setDisplayRandomRecipe,
        selectMeal,
        selectedMeal,
        toggleFavorite,
        favoriteMeal,
        setFavoriteMeal,
        favoriteRecipes,
        favoritesError,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useGlobalContext = () => {
  return useContext(AppContext)
}
