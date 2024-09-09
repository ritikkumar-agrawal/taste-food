import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useFirestore } from '../../hooks/useFirestore'
import { useRecipeImageUpload } from '../../hooks/useRecipeImageUpload'
import CustomButton from '../../components/CustomButton'
import { useGlobalContext } from '../../context/AppContext'
import {
  Form,
  InputGroup,
  Button,
  Spinner,
  Image,
  Container,
  Row,
  Col,
} from 'react-bootstrap'

// styles
import './Create.css'

export default function Create() {
  const navigate = useNavigate()
  const { addDocument, response } = useFirestore('recipes')
  const { user } = useAuthContext()
  const { mode } = useTheme()
  const { setSearchTerm } = useGlobalContext()
  const {
    uploadRecipeImage,
    uploadProgress,
    error: imageUploadError,
    isImageUploading,
  } = useRecipeImageUpload(user)

  //form field values
  const [title, setTitle] = useState('')
  const [method, setMethod] = useState('')
  const [cookingHours, setCookingHours] = useState('')
  const [cookingMinutes, setCookingMinutes] = useState('')
  const [newIngredient, setNewIngredient] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState(null)
  const [ingredientError, setIngredientError] = useState(null)
  const [recipeImage, setRecipeImage] = useState(null)
  const [recipeImageError, setRecipeImageError] = useState(null)
  const ingredientInput = useRef(null)
  const fileInputRef = useRef(null)

  const handleGoHome = () => {
    setSearchTerm('')
    navigate('/')
  }

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const handleRecipeImageChange = (e) => {
    setRecipeImageError(null)
    setRecipeImage(null)

    let selectedImage = e.target.files[0]
    if (!selectedImage) {
      setRecipeImageError(
        'No image selected. You can add an image that represents your recipe.'
      )
    } else if (!selectedImage.type.includes('image')) {
      setRecipeImageError('Selected file must be an image')
    } else if (selectedImage.size > 1000000) {
      setRecipeImageError('The file is too large. Maximum size is 1MB')
    } else {
      setRecipeImageError(null)
      setRecipeImage(selectedImage)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Recipe image is updated')
      }
    }
  }

  const handleClearImage = () => {
    setRecipeImage(null)
    if (fileInputRef.current) {
      // Clear the file input value
      fileInputRef.current.value = null
    }
  }

  const handleAdd = (e) => {
    e.preventDefault()
    const ing = newIngredient.trim()

    if (ing && !ingredients.includes(ing)) {
      setIngredients((prevIngredients) => [...prevIngredients, ing])
      setNewIngredient('')
      setIngredientError(null)
    } else {
      setIngredientError('Ingredient already exists in the list.')
    }

    setNewIngredient('')

    ingredientInput.current.focus()
  }

  const handleIngredientClick = (index) => {
    setSelectedIngredientIndex(selectedIngredientIndex === index ? null : index)
  }

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index)
    setIngredients(updatedIngredients)
    setSelectedIngredientIndex(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let hasErrors = false

    if (ingredients.length === 0) {
      setIngredientError('Please add at least one ingredient')
      hasErrors = true
      return
    } else {
      setIngredientError(null)
    }

    let formattedCookingTime = ''
    if (cookingHours > 0) {
      formattedCookingTime +=
        cookingHours + ' hour' + (cookingHours > 1 ? 's' : '')
    }
    if (cookingMinutes > 0) {
      if (formattedCookingTime) {
        formattedCookingTime += ' '
      }
      formattedCookingTime +=
        cookingMinutes + ' minute' + (cookingMinutes > 1 ? 's' : '')
    }

    let imageURL = null
    let imageUploadProgress = 0

    if (recipeImage) {
      imageURL = await uploadRecipeImage(recipeImage, (progress) => {
        imageUploadProgress = progress
      })
      if (!imageURL || imageUploadError) {
        setRecipeImageError('Error uploading image. Please try again.')
        hasErrors = true
        return
      }
    }

    const createdBy = {
      displayName: user.displayName,
      photoURL: user.photoURL,
      id: user.uid,
    }

    const recipe = {
      title,
      ingredients,
      method,
      cookingTime: formattedCookingTime,
      createdBy,
      imageURL:
        imageURL ||
        'https://firebasestorage.googleapis.com/v0/b/tasty-treats-site.appspot.com/o/recipeImages%2Fdefault%2FnoRecipe.png?alt=media&token=2c22c482-f5b1-41d9-adb8-e0f39f27dcf2',
    }

    try {
      // Call the addDocument function from useFirestore hook
      await addDocument(recipe)
      // Check if there are any errors or an error in the response
      if (!response.error) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(recipe)
        }
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Container
      className="create d-flex align-items-center justify-content-center my-4"
      data-bs-theme={mode === 'light' ? null : 'dark'}
    >
      <Row className="justify-content-center">
        <Col xs={12}>
          <div className="text-center">
            <CustomButton className="mb-4" onClick={handleGoHome}>
              Return to Homepage
            </CustomButton>
          </div>
          <h2 className="fs-2 fw-bolder text-center mb-3">Add a New Recipe</h2>
          <Form onSubmit={handleSubmit} className="create-form">
            <Form.Group controlId="recipeTitle" className="mb-3">
              <Form.Label>Recipe Title</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Enter recipe title"
                onChange={(e) =>
                  setTitle(capitalizeFirstLetter(e.target.value))
                }
                value={title}
              />
            </Form.Group>

            <Form.Group controlId="recipeIngredients" className="mb-3">
              <Form.Label>Recipe Ingredients</Form.Label>
              <InputGroup>
                <Form.Control
                  className="me-2"
                  type="text"
                  placeholder="Enter recipe ingredients"
                  onChange={(e) => setNewIngredient(e.target.value)}
                  value={newIngredient}
                  ref={ingredientInput}
                />
                <CustomButton onClick={handleAdd}>Add</CustomButton>
              </InputGroup>
              <p className="fs-6 mt-2">
                Current Ingredients:{' '}
                {ingredients.map((ingredient, index) => (
                  <span key={ingredient} className="ingredient-text">
                    <span
                      className={`${
                        selectedIngredientIndex === index ? 'clickable' : ''
                      }`}
                      onClick={() => handleIngredientClick(index)}
                    >
                      {ingredient}
                    </span>
                    {selectedIngredientIndex === index && (
                      <Button
                        size="sm"
                        className="ms-1 fw-semibold"
                        variant="outline-danger"
                        onClick={() => handleRemoveIngredient(index)}
                      >
                        &times;
                      </Button>
                    )}
                    {index !== ingredients.length - 1 && ', '}
                  </span>
                ))}
              </p>
              {ingredientError && (
                <Form.Text className="text-danger">{ingredientError}</Form.Text>
              )}
            </Form.Group>

            <Form.Group controlId="recipeMethod" className="mb-3">
              <Form.Label>Recipe Method</Form.Label>
              <Form.Control
                required
                as="textarea"
                placeholder="Enter recipe methods"
                onChange={(e) =>
                  setMethod(capitalizeFirstLetter(e.target.value))
                }
                value={method}
              />
            </Form.Group>

            <Form.Group controlId="cookingTime" className="mb-3">
              <Form.Label>Cooking Time</Form.Label>
              <InputGroup className="mb-2">
                <Form.Select
                  required
                  aria-label="Select cooking hours"
                  onChange={(e) => setCookingHours(e.target.value)}
                  value={cookingHours}
                >
                  <option value="">Hours</option>
                  {Array.from({ length: 24 }, (_, index) => (
                    <option key={index} value={index}>
                      {index}
                    </option>
                  ))}
                </Form.Select>
                <InputGroup.Text>:</InputGroup.Text>
                <Form.Select
                  required
                  aria-label="Select cooking minutes"
                  onChange={(e) => setCookingMinutes(e.target.value)}
                  value={cookingMinutes}
                >
                  <option value="">Minutes</option>
                  {Array.from({ length: 60 }, (_, index) => (
                    <option key={index} value={index}>
                      {index}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
              <p className="fs-6 fw-normal">
                {`Cooking Time: ${
                  cookingHours > 0
                    ? `${cookingHours} hour${cookingHours > 1 ? 's' : ''}`
                    : ''
                } ${
                  cookingMinutes > 0
                    ? `${cookingMinutes} minute${cookingMinutes > 1 ? 's' : ''}`
                    : ''
                }`}
              </p>
            </Form.Group>

            <Form.Group controlId="recipeImage" className="mb-3">
              <Form.Label>Recipe Image (optional)</Form.Label>
              <InputGroup>
                <Form.Control
                  className={recipeImage ? 'me-2' : ''}
                  type="file"
                  accept="image/*"
                  onChange={handleRecipeImageChange}
                  aria-label="Recipe Image Upload"
                  aria-describedby="recipeImageDesc"
                  ref={fileInputRef}
                />
                {recipeImage && (
                  <Button
                    className="fw-semibold"
                    variant="outline-danger"
                    size="md"
                    onClick={handleClearImage}
                  >
                    &times;
                  </Button>
                )}
              </InputGroup>
              {recipeImageError && (
                <Form.Text className="text-danger">
                  {recipeImageError}
                </Form.Text>
              )}
              {!recipeImageError && recipeImage && (
                <div className="image-preview">
                  <Image
                    src={URL.createObjectURL(recipeImage)}
                    alt="Recipe"
                    className="mt-4"
                  />
                </div>
              )}
              {!recipeImageError && !recipeImage && (
                <Form.Text id="recipeImageDesc">
                  No image selected. You can add an image that represents your
                  recipe.
                </Form.Text>
              )}
              {isImageUploading && (
                <Form.Text
                  id="uploadRecipeImageProgressBlock"
                  className={mode === 'dark' ? 'text-light' : 'text-muted'}
                >
                  {`Uploaded ${uploadProgress}%`}
                </Form.Text>
              )}
            </Form.Group>

            <CustomButton
              className="w-100 mt-3"
              type="submit"
              disabled={isImageUploading}
            >
              {isImageUploading && (
                <Spinner
                  as="span"
                  animation="grow"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
              )}
              {isImageUploading ? 'Loading' : 'Add Recipe'}
            </CustomButton>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}
