import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { Form, InputGroup, FormControl, Button } from 'react-bootstrap'
import { useGlobalContext } from '../context/AppContext'

// import './SearchBar.css'

export default function SearchBar() {
  const { mode } = useTheme()
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [randomRecipe, setRandomRecipe] = useState(null)
  const { setSearchTerm, fetchRandomMeal, setDisplayRandomRecipe } =
    useGlobalContext()

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (term.trim()) {
      setSearchTerm(term)
      setTerm('')
      navigate(`/search?q=${term}`)
    }
  }

  const handleClear = () => {
    setTerm('')
  }

  const handleRandomMeal = async () => {
    setSearchTerm('')
    setTerm('')
    setDisplayRandomRecipe(true)

    // Check if random recipe is already fetched
    if (!randomRecipe) {
      await fetchRandomMeal()
    }
  }

  return (
    <Form
      onSubmit={handleSubmit}
      data-bs-theme={mode === 'light' ? null : 'dark'}
      className="d-flex align-items-center"
    >
      <InputGroup>
        <FormControl
          required
          type="text"
          placeholder="Type favorite meal"
          onChange={(e) => setTerm(capitalizeFirstLetter(e.target.value))}
          value={term}
          aria-label="Recipe Name Search"
          aria-describedby="RecipeNameSearchInput"
        />
        {term && (
          <Button
            className="fw-semibold fs-5 ms"
            variant="outline-danger"
            onClick={handleClear}
            size="sm"
          >
            &times;
          </Button>
        )}
        <Button
          className="ms-2 fw-semibold"
          variant="outline-dark"
          type="submit"
          style={{
            borderColor: mode === 'light' ? '#2d4262' : '#288fb3',
            color: mode === 'light' ? '#2d4262' : '#288fb3',
            backgroundColor: 'transparent',
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor =
              mode === 'light' ? '#1f3045' : '#1e6b8a'
            e.target.style.borderColor =
              mode === 'light' ? '#1f3045' : '#1e6b8a'
            e.target.style.color = '#fff'
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.borderColor =
              mode === 'light' ? '#2d4262' : '#288fb3'
            e.target.style.color = mode === 'light' ? '#2d4262' : '#288fb3'
          }}
        >
          Search
        </Button>
        <Button
          className="ms-2 fw-semibold"
          variant="outline-dark"
          onClick={handleRandomMeal}
          style={{
            borderColor: mode === 'light' ? '#00370b' : '#63cc5a',
            color: mode === 'light' ? '#00370b' : '#63cc5a',
            backgroundColor: 'transparent',
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor =
              mode === 'light' ? '#002a09' : '#4eaf47'
            e.target.style.borderColor =
              mode === 'light' ? '#002a09' : '#4eaf47'
            e.target.style.color = '#fff'
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.borderColor =
              mode === 'light' ? '#00370b' : '#63cc5a'
            e.target.style.color = mode === 'light' ? '#00370b' : '#63cc5a'
          }}
        >
          Surprise Me!
        </Button>
      </InputGroup>
    </Form>
  )
}
