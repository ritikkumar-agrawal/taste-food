import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import LikeButton from './LikeButton'
import { doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Card, Row, Col, Spinner } from 'react-bootstrap'

import './RecipeList.css'

const renderRecipeCard = (recipe, selectMeal, mode, cardColor) => (
  <Col key={recipe.id || recipe.idMeal} className="single-meal">
    <Card
      className="h-100 shadow-sm d-flex flex-column justify-content-between"
      style={{ background: cardColor }}
    >
      <div className="card-img-container">
        <Link
          to={`/recipes/${recipe.id || recipe.idMeal}`}
          className="link-container"
          onClick={() => selectMeal(recipe.id || recipe.idMeal)}
        >
          <Card.Img
            variant="top"
            src={recipe.imageURL || recipe.strMealThumb}
            alt={`Recipe: ${recipe.title || recipe.strMeal}`}
            className="recipe-img"
            loading="lazy"
          />
        </Link>
      </div>
      <Card.Body className="d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between">
          <Link
            to={`/recipes/${recipe.id || recipe.idMeal}`}
            className="link-container"
            onClick={() => selectMeal(recipe.id || recipe.idMeal)}
          >
            <Card.Title
              className={`my-auto ${
                mode === 'dark' ? 'dark-title' : 'light-title'
              }`}
            >
              {recipe.title || recipe.strMeal}
            </Card.Title>
          </Link>
          <LikeButton
            recipe={recipe}
            docRef={doc(db, 'favorites/' + recipe.id || recipe.idMeal)}
          />
        </div>
      </Card.Body>
    </Card>
  </Col>
)

export default function RecipeList({
  recipes = [],
  meals = [],
  mealsLoading,
  selectMeal,
  randomRecipe,
  displayRandomRecipe,
  favoriteRecipes = [],
  error,
}) {
  const { mode, cardColor, buttonColor } = useTheme()
  const location = useLocation()

  const isFavoritesRoute = location.pathname === '/favorites'
  const mappedMeals = meals.map((meal) => ({
    id: meal.idMeal,
    title: meal.strMeal,
    imageURL: meal.strMealThumb,
  }))

  const combinedRecipes = [...recipes, ...mappedMeals]
  const filteredRecipes = combinedRecipes.filter((recipe) => recipe.title)
  filteredRecipes.sort((a, b) => a.title.localeCompare(b.title))

  const mappedFavoriteRecipes = favoriteRecipes.map((favoriteRecipe) => ({
    id: favoriteRecipe.idMeal,
    title: favoriteRecipe.strMeal || favoriteRecipe.title,
    imageURL: favoriteRecipe.strMealThumb || favoriteRecipe.imageURL,
  }))

  mappedFavoriteRecipes.sort((a, b) => a.title.localeCompare(b.title))

  return (
    <Row xs={1} sm={2} md={3} lg={4} xxl={5} className="g-4">
      {mealsLoading ? (
        <div className="w-100 d-flex align-items-center justify-content-center">
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
      ) : isFavoritesRoute ? (
        mappedFavoriteRecipes.length === 0 ? (
          <div className="w-100 d-flex align-items-center justify-content-center no-recipes-found">
            {/* Display a message if there are no favorite recipes */}
            <p className="fw-bolder fs-4 my-0 text-center">
              No favorite recipes found.
              <br />
              <Link
                to="/create"
                className={`add-recipe-link d-flex align-items-center py-2 ${
                  mode === 'light' ? 'text-dark' : 'text-light'
                }`}
              >
                <span className="add-recipe-text fw-bold">
                  Start by adding recipes
                </span>
                <span className="add-recipe-icon ms-1 fs-2">&#43;</span>
              </Link>
            </p>
          </div>
        ) : (
          mappedFavoriteRecipes.map((favoriteRecipe) =>
            renderRecipeCard(favoriteRecipe, selectMeal, mode, cardColor)
          )
        )
      ) : filteredRecipes.length === 0 ? (
        <div className="w-100 d-flex align-items-center justify-content-center no-recipes-found">
          <p className="fw-bolder fs-4 my-0 text-center">
            {!error && <span>No recipes found.</span>}
            {!error && <br />}
            <Link
              to="/create"
              className={`add-recipe-link d-flex align-items-center py-2 ${
                mode === 'light' ? 'text-dark' : 'text-light'
              }`}
            >
              <span className="add-recipe-text fw-bold">
                Start by adding recipes
              </span>
              <span className="add-recipe-icon ms-1 fs-2">&#43;</span>
            </Link>
          </p>
        </div>
      ) : displayRandomRecipe && randomRecipe ? (
        renderRecipeCard(randomRecipe, selectMeal, mode, cardColor)
      ) : (
        filteredRecipes.map((recipe) =>
          renderRecipeCard(recipe, selectMeal, mode, cardColor)
        )
      )}
    </Row>
  )
}
