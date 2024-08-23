import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDocument } from '../../hooks/useDocument'
import { useGlobalContext } from '../../context/AppContext'
import { useTheme } from '../../hooks/useTheme'
import { useFirestore } from '../../hooks/useFirestore'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useRecipeImageUpload } from '../../hooks/useRecipeImageUpload'
import { doc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Button,
  Form,
  OverlayTrigger,
  Tooltip,
  Modal,
  CloseButton,
  Image,
  Popover,
  InputGroup,
  ListGroup,
  Badge,
} from 'react-bootstrap'
import Avatar from '../../components/Avatar'
import LikeButton from '../../components/LikeButton'
import CustomButton from '../../components/CustomButton'
import axios from 'axios'

// styles
import './Recipe.css'
import editIconLight from '../../assets/edit_iconLight.svg'
import editIconDark from '../../assets/edit_iconDark.svg'
import DeleteIconDark from '../../assets/delete_IconDark.svg'
import DeleteIconWhite from '../../assets/delete_IconWhite.svg'
import StarEmptyLight from '../../assets/starEmptyLight.svg'
import StarFilledLight from '../../assets/starFilledLight.svg'
import StarEmptyDark from '../../assets/starEmptyDark.svg'
import StarFilledDark from '../../assets/starFilledDark.svg'

export default function Recipe() {
  // Define a common data structure for recipe details
  const [recipeDetails, setRecipeDetails] = useState({
    // id: '',
    image: '',
    title: '',
    time: '',
    ingredients: '',
    text: '',
    source: '',
  })

  const navigate = useNavigate()
  const { mode, cardColor, commentColor, buttonColor } = useTheme()
  const { user } = useAuthContext()
  const { id } = useParams()
  const { document: firestoreDocument, error: firestoreError } = useDocument(
    'recipes',
    id
  )
  const { document: favoriteRecipe, error: favoritesError } = useDocument(
    'favorites',
    id
  )

  const { document: recipeComment, error: recipeCommentsError } = useDocument(
    'comments',
    recipeDetails.id || ''
  )

  const { deleteDocument, updateDocument } = useFirestore('recipes')
  const {
    addDocument: addCommentDocument,
    updateDocument: updateCommentDocument,
    deleteDocument: deleteCommentDocument,
    response: commentResponse,
  } = useFirestore('comments')

  const {
    selectedMeal,
    searchTerm,
    randomRecipe,
    setRandomRecipe,
    displayRandomRecipe,
    setDisplayRandomRecipe,
    selectMeal,
    setSearchTerm,
  } = useGlobalContext()

  const {
    uploadRecipeImage,
    uploadProgress,
    setUploadProgress,
    error: imageUploadError,
    isImageUploading,
    setIsImageUploading,
  } = useRecipeImageUpload(user)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const tooltipClassName = `'tooltip' ${mode === 'light' ? '' : 'darkTooltip'}`

  const [editingImage, setEditingImage] = useState(false)
  const [newImage, setNewImage] = useState(null)
  const [imageError, setImageError] = useState(null)

  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState('')

  const [editingCookingTime, setEditingCookingTime] = useState(false)
  const [editedCookingHours, setEditedCookingHours] = useState('')
  const [editedCookingMinutes, setEditedCookingMinutes] = useState('')
  const [cookingTimeError, setCookingTimeError] = useState('')

  const [editingIngredients, setEditingIngredients] = useState(false)
  const [editedIngredients, setEditedIngredients] = useState('')
  const [ingredientsError, setIngredientsError] = useState('')

  const [editingMethod, setEditingMethod] = useState(false)
  const [method, setMethod] = useState('')
  const [methodError, setMethodError] = useState('')

  const [newComment, setNewComment] = useState('')
  const [newCommentAdd, setNewCommentAdd] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [newCommentRating, setNewCommentRating] = useState(0)
  const [editingCommentRating, setEditingCommentRating] = useState(0)
  const [commentToDelete, setCommentToDelete] = useState(null)
  const [commentAddError, setCommentAddError] = useState('')
  const [commentEditError, setCommentEditError] = useState('')
  const [isCommentPopoverVisible, setIsCommentPopoverVisible] = useState(false)

  useEffect(() => {
    // Fetch recipe details only if the selectedMeal is not already set
    if (!selectedMeal) {
      const fetchRecipeDetailsById = async () => {
        try {
          // Fetch the recipe details using the selected meal's ID
          const response = await axios.get(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
          )

          // Set the selectedMeal state with the fetched recipe details
          const mealDetails = response.data.meals && response.data.meals[0]
          if (mealDetails) {
            // Use the selectMeal function from the context
            selectMeal(mealDetails.idMeal || mealDetails.id || '')
          } else {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('Recipe details not found.')
            }
          }

          // Set loading to false once the data is fetched
          setLoading(false)
          // Set the recipe details state
          setRecipeDetails({
            id: mealDetails.idMeal || mealDetails.id || '',
            image: mealDetails.strMealThumb || mealDetails.imageURL || '',
            title: mealDetails.strMeal || mealDetails.title || '',
            time: mealDetails.cookingTime || 'Varies',
            text: mealDetails.strInstructions || mealDetails.method || '',
            ingredients:
              formatIngredients(mealDetails) ||
              (mealDetails.ingredients && mealDetails.ingredients.join(', ')) ||
              'No ingredients listed for this recipe',
            source:
              mealDetails.strSource ||
              mealDetails.source ||
              'Source not available',
          })
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error fetching recipe details:', error)
          }
          // Set loading to false in case of an error
          setLoading(false)
        }
      }

      // Call the fetchRecipeDetailsById function
      fetchRecipeDetailsById()
    }
  }, [selectedMeal, id, selectMeal])

  useEffect(() => {
    const recipeToDisplay =
      favoriteRecipe || selectedMeal || randomRecipe || firestoreDocument || {}

    if (!recipeToDisplay) {
      setLoading(false)
      navigate('/not-found')
      // Exit early if there's no recipe to display
      return
    } else if (
      favoriteRecipe ||
      selectedMeal ||
      randomRecipe ||
      firestoreDocument
    ) {
      // Handle both API recipes and firestoreDocuments
      setRecipeDetails({
        id: recipeToDisplay.idMeal || recipeToDisplay.id || '',
        image: recipeToDisplay.strMealThumb || recipeToDisplay.imageURL || '',
        title: recipeToDisplay.strMeal || recipeToDisplay.title || '',
        time: recipeToDisplay.cookingTime || 'Varies',
        text: recipeToDisplay.strInstructions || recipeToDisplay.method || '',
        ingredients:
          formatIngredients(recipeToDisplay) ||
          (recipeToDisplay.ingredients &&
            recipeToDisplay.ingredients.join(', ')) ||
          'No ingredients listed for this recipe',
        source:
          recipeToDisplay.strSource ||
          recipeToDisplay.source ||
          'Source not available',
      })
      // Set loading to false once the data is fetched
      setLoading(false)
    }
  }, [
    firestoreDocument,
    favoriteRecipe,
    selectedMeal,
    randomRecipe,
    displayRandomRecipe,
    firestoreError,
    favoritesError,
    navigate,
  ])

  // Function to format ingredients
  const formatIngredients = (meal) => {
    const ingredients = []
    for (let i = 1; i <= 20; i++) {
      const ingredientKey = `strIngredient${i}`
      const measureKey = `strMeasure${i}`
      const ingredient = meal?.[ingredientKey]
      const measure = meal?.[measureKey]

      if (ingredient) {
        const ingredientText = measure ? `${measure} ${ingredient}` : ingredient
        ingredients.push(ingredientText)
      }
    }
    return ingredients.join(', ')
  }

  const handleGoToHomepage = () => {
    // Reset the randomRecipe and displayRandomRecipe states
    setRandomRecipe(null)
    setDisplayRandomRecipe(false)
    // Navigate back to the homepage
    navigate('/')
  }

  const handleGoToHomepageWithSearch = () => {
    // Clear the search term by setting it to an empty string
    setSearchTerm('')
    // Navigate back to the homepage
    navigate('/')
  }

  // Determine if a search is active (replace with your actual search state)
  const isSearchActive = searchTerm.trim() !== ''

  const isEditable =
    firestoreDocument && user && user.uid === firestoreDocument.createdBy.id

  const handleDelete = async () => {
    // Close the modal
    setShowDeleteModal(false)

    try {
      // Delete the recipe
      await deleteDocument(doc(db, 'recipes/' + firestoreDocument.id))
      // Navigate to the homepage page after deletion
      navigate('/')
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error deleting recipe:', error)
      }
    }
  }

  // Function to extract the image name from the URL
  const getImageNameFromURL = (imageUrl) => {
    const urlParts = imageUrl.split('/')

    // Handle Firebase Storage URL structure
    if (imageUrl.includes('?alt=media&token=')) {
      const lastPart = urlParts[urlParts.length - 1]
      const parts = lastPart.split('%2F')
      return parts[parts.length - 1].split('?')[0]
    } else {
      // Handle direct image URL
      return urlParts[urlParts.length - 1]
    }
  }

  const handleEditImage = () => {
    setEditingImage(true)
  }

  const handleSaveImage = async () => {
    try {
      setIsImageUploading(true)

      // Check if a new image is selected
      if (!newImage) {
        setImageError(
          'No image selected. You can add an image that represents your recipe.'
        )
        setIsImageUploading(false)
        return
      }

      // Perform image checks
      if (!newImage.type.includes('image')) {
        setImageError('Selected file must be an image')
        setIsImageUploading(false)
        return
      } else if (newImage.size > 1000000) {
        setImageError('The file is too large. Maximum size is 1MB')
        setIsImageUploading(false)
        return
      } else if (newImage.name === getImageNameFromURL(recipeDetails.image)) {
        setImageError('Selected image is the same as the current one.')
        setIsImageUploading(false)
        return
      } else {
        setImageError(null)
        setIsImageUploading(false)
      }

      // Upload the new image
      const imageURL = await uploadRecipeImage(newImage, setUploadProgress)

      // Update the recipe with the new image URL
      const updatedRecipe = { ...firestoreDocument, imageURL }
      await updateDocument(firestoreDocument.id, updatedRecipe)

      // Update local state immediately after save
      setRecipeDetails({ ...recipeDetails, image: imageURL })

      setIsImageUploading(false)
      setEditingImage(false)
      setImageError('')
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error updating recipe image:', error)
      }
      setIsImageUploading(false)
    }
  }

  const handleCancelImage = () => {
    setNewImage(null)
    setIsImageUploading(false)
    setEditingImage(false)
    setImageError('')
  }

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0])
  }

  const handleEditTitle = () => {
    setEditingTitle(true)
    setTitle(recipeDetails.title)
  }

  const handleSaveTitle = async () => {
    try {
      if (!title.trim()) {
        // Title is empty, set an error message
        setTitleError('Title cannot be empty')
        return
      }
      const updatedRecipe = { ...firestoreDocument, title }
      await updateDocument(firestoreDocument.id, updatedRecipe)

      // Update local state immediately after save
      setRecipeDetails({ ...recipeDetails, title })

      // Set editing state after updating UI-related state
      setEditingTitle(false)

      // Clear the title error on successful save
      setTitleError('')
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error updating recipe title:', error)
      }
    }
  }

  const handleCancelTitle = () => {
    setTitle(firestoreDocument.title || '')
    setEditingTitle(false)
    setTitleError('')
  }

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
  }

  const handleEditTime = () => {
    setEditingCookingTime(true)
    setEditedCookingHours('')
    setEditedCookingMinutes('')
  }

  const handleSaveTime = async () => {
    try {
      if (!editedCookingHours.trim() && !editedCookingMinutes.trim()) {
        // Title is empty, set an error message
        setCookingTimeError('Cooking Time cannot be empty')
        return
      }
      // Validate and save the edited cooking time
      const hours = parseInt(editedCookingHours, 10) || 0
      const minutes = parseInt(editedCookingMinutes, 10) || 0

      // Create formatted cooking time string
      const formattedCookingTime =
        (hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '') +
        (hours > 0 && minutes > 0 ? ' ' : '') +
        (minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : '')

      // Update the recipe details and Firestore document
      const updatedRecipe = {
        ...firestoreDocument,
        cookingTime: formattedCookingTime,
      }

      await updateDocument(firestoreDocument.id, updatedRecipe)

      // Update local state
      setEditingCookingTime(false)
      setRecipeDetails({ ...recipeDetails, time: formattedCookingTime })
      // Clear the title error on successful save
      setCookingTimeError('')
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error updating cooking time:', error)
      }
    }
  }

  const handleCancelTime = () => {
    // Reset the edited values and toggle editing status
    setEditedCookingHours('')
    setEditedCookingMinutes('')
    setEditingCookingTime(false)
    setCookingTimeError('')
  }

  const handleEditIngredients = () => {
    setEditingIngredients(true)
    setEditedIngredients(recipeDetails.ingredients)
  }

  const handleSaveIngredients = async () => {
    try {
      if (!editedIngredients.trim()) {
        // Edited ingredients are empty, set an error message
        setIngredientsError('Ingredients cannot be empty')
        return
      }

      // Split the ingredients using commas and trim each item and filter out any empty items
      const updatedIngredients = editedIngredients
        .split(/\s*,\s*/)
        .map((item) => item.trim())
        .filter((item) => item !== '')

      const updatedRecipe = {
        ...firestoreDocument,
        ingredients: updatedIngredients,
      }
      await updateDocument(firestoreDocument.id, updatedRecipe)

      // Update local state immediately after save
      setRecipeDetails({
        ...recipeDetails,
        ingredients: updatedIngredients.join(', '),
      })

      setEditingIngredients(false)
      // Clear the title error on successful save
      setIngredientsError('')
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error updating recipe ingredients:', error)
      }
    }
  }

  const handleCancelIngredients = () => {
    setEditedIngredients(firestoreDocument.ingredients || '')
    setEditingIngredients(false)
    setIngredientsError('')
  }

  const handleIngredientsChange = (e) => {
    setEditedIngredients(e.target.value)
  }

  const formatIngredientsForDisplay = (ingredients) => {
    if (Array.isArray(ingredients)) {
      // For Firestore recipes (array of strings)
      return ingredients.map((ingredient, index) => (
        <p key={index} className="fw-normal">
          {ingredient.trim()}
        </p>
      ))
    } else {
      // For API recipes (string with commas)
      return ingredients.split(',').map((ingredient, index) => (
        <p key={index} className="fw-normal">
          {ingredient.trim()}
        </p>
      ))
    }
  }

  const handleEditMethod = () => {
    setEditingMethod(true)
    setMethod(recipeDetails.text)
  }

  const handleSaveMethod = async () => {
    try {
      if (!method.trim()) {
        // Title is empty, set an error message
        setMethodError('Cooking instructions cannot be empty')
        return
      }

      const updatedMethod = { ...firestoreDocument, method }
      await updateDocument(firestoreDocument.id, updatedMethod)

      // Update local state immediately after save
      setRecipeDetails({ ...recipeDetails, text: method })

      setEditingMethod(false)

      // Clear the title error on successful save
      setMethodError('')
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error updating recipe method:', error)
      }
    }
  }

  const handleCancelMethod = () => {
    setMethod(firestoreDocument.method || '')
    setEditingMethod(false)
    setMethodError('')
  }

  const handleMethodChange = (e) => {
    setMethod(e.target.value)
  }

  const handleAddStarClick = (clickedRating) => {
    setNewCommentRating((prevRating) =>
      prevRating === clickedRating ? 0 : clickedRating
    )
  }

  const handleStarClick = (clickedRating) => {
    setEditingCommentRating((prevRating) =>
      prevRating === clickedRating ? 0 : clickedRating
    )
  }

  const handleAddComment = async () => {
    // Check if the user is logged in
    if (!user) {
      setIsCommentPopoverVisible(!isCommentPopoverVisible)
      return
    }

    if (!newCommentAdd.trim()) {
      setCommentAddError('Comments cannot be empty')
      return
    }

    // Reset comment error state
    setCommentAddError('')

    const commentData = {
      idMeal: recipeDetails.id,
      content: newCommentAdd,
      rating: newCommentRating,
      addedBy: {
        id: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    }
    await addCommentDocument(commentData)

    setNewCommentAdd('')
    setNewCommentRating(0)
    setIsCommentPopoverVisible(false)
  }

  const handleEditComment = (commentId, commentContent, commentRating) => {
    if (editingCommentId === commentId) {
      // Check if the edited comment is empty
      if (!newComment.trim()) {
        setCommentEditError('Comments cannot be empty')
        return
      }
      // Save edited comment
      updateCommentDocument(commentId, {
        content: newComment,
        rating: editingCommentRating,
      })

      // Reset the state after saving
      setNewComment('')
      setEditingCommentRating(0)
      setEditingCommentId(null)
      // Clear any previous errors
      setCommentEditError('')
    } else {
      // Enter edit mode for the clicked comment
      setNewComment(commentContent)
      setEditingCommentRating(commentRating)
      setEditingCommentId(commentId)
    }
  }

  const handleDeleteComment = async (commentId) => {
    // Close the modal
    setShowDeleteModal(false)
    const commentDocRef = doc(db, 'comments', commentId)
    await deleteCommentDocument(commentDocRef)
    setCommentToDelete(null)
  }

  const handleCancelEditComment = () => {
    setNewComment('')
    setNewCommentRating(0)
    setEditingCommentId(null)
    setCommentEditError('')
  }

  // Sort comments by createdAt timestamp in ascending order
  const sortedComments =
    recipeComment &&
    recipeComment.slice().sort((a, b) => b.createdAt - a.createdAt)

  return (
    <Container
      data-bs-theme={mode === 'light' ? null : 'dark'}
      className="recipe-container"
    >
      <div className="d-flex align-items-center justify-content-center my-4">
        <CustomButton
          onClick={
            isSearchActive ? handleGoToHomepageWithSearch : handleGoToHomepage
          }
        >
          Return to Homepage
        </CustomButton>
      </div>
      {loading ? (
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
      ) : (
        <Row className="my-4">
          {/* Recipe Card */}
          <Col lg={8} md={12} className="mb-4 mb-lg-0">
            <Card className="recipe-details" style={{ background: cardColor }}>
              <div className="big-card-img-container">
                <Card.Img
                  variant="top"
                  src={recipeDetails.image}
                  alt={recipeDetails.title}
                  className="big-recipe-img"
                  loading="lazy"
                />

                {isEditable && (
                  <>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip role="tooltip" className={tooltipClassName}>
                          <span>Delete Recipe</span>
                        </Tooltip>
                      }
                    >
                      <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                        className="delete-button p-3"
                      >
                        <Image
                          aria-label="delete icon"
                          src={
                            mode === 'dark' ? DeleteIconDark : DeleteIconWhite
                          }
                          alt="delete icon"
                          style={{ padding: '3px' }}
                        />
                      </Button>
                    </OverlayTrigger>
                    {/* Delete Confirmation Modal */}
                    <Modal
                      show={showDeleteModal}
                      onHide={() => setShowDeleteModal(false)}
                      data-bs-theme={mode === 'light' ? null : 'dark'}
                      className={
                        mode === 'light'
                          ? 'light-theme-modal'
                          : 'dark-theme-modal'
                      }
                    >
                      {/* <Modal.Header closeButton> */}
                      <Modal.Header>
                        <Modal.Title>Delete Recipe</Modal.Title>
                        <CloseButton
                          onClick={() => setShowDeleteModal(false)}
                          aria-label="Hide"
                          className="close-button-no-border"
                        />
                      </Modal.Header>
                      <Modal.Body>
                        Are you sure you want to delete this recipe?
                      </Modal.Body>
                      <Modal.Footer>
                        <Button
                          variant="secondary"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                          Delete
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </>
                )}
              </div>
              <Card.Body className="mb-2">
                {isEditable && editingImage && (
                  <div className="d-flex align-items-center pb-1">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      aria-label="Recipe Image Upload"
                      aria-describedby="recipeImageDesc"
                    />
                    <Button
                      onClick={handleSaveImage}
                      className="ms-2 fw-semibold"
                      variant="outline-dark"
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
                        e.target.style.color =
                          mode === 'light' ? '#00370b' : '#63cc5a'
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelImage}
                      className="ms-2 fw-semibold"
                      variant="outline-danger"
                      size="md"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {isImageUploading && !imageError && (
                  <div className="uploading-indicator">
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
                      Uploading image...
                    </span>
                    <span className="fw-bolder my-0 ms-2">{`Uploaded ${uploadProgress}%`}</span>
                    <Form.Text className="d-flex">
                      Do not close or navigate away until the upload is
                      complete.
                    </Form.Text>
                  </div>
                )}
                {imageError && (
                  <Form.Text className="text-danger">{imageError}</Form.Text>
                )}
                <div className="d-flex justify-content-between">
                  <Card.Title className="fs-3 mb-0">
                    {isEditable && editingTitle ? (
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          placeholder="Enter recipe title"
                          onChange={handleTitleChange}
                          value={title}
                          aria-label="Recipe Title"
                          aria-describedby="RecipeTitleInput"
                        />
                        <Button
                          className="ms-2 fw-semibold"
                          variant="outline-dark"
                          onClick={handleSaveTitle}
                          style={{
                            borderColor:
                              mode === 'light' ? '#00370b' : '#63cc5a',
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
                            e.target.style.color =
                              mode === 'light' ? '#00370b' : '#63cc5a'
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          className="ms-2 fw-semibold"
                          variant="outline-danger"
                          size="md"
                          onClick={handleCancelTitle}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center">
                        {recipeDetails.title}
                        {isEditable && (
                          <Image
                            className="px-1"
                            src={mode === 'dark' ? editIconDark : editIconLight}
                            alt="Edit Title"
                            onClick={handleEditTitle}
                            style={{
                              cursor: 'pointer',
                              width: '2.3rem',
                              height: '2.3rem',
                            }}
                          />
                        )}
                      </div>
                    )}
                    {titleError && (
                      <Form.Text className="text-danger">
                        {titleError}
                      </Form.Text>
                    )}
                  </Card.Title>

                  <div className="d-flex align-items-center">
                    {isEditable && (
                      <OverlayTrigger
                        placement="bottom"
                        overlay={
                          <Tooltip role="tooltip" className={tooltipClassName}>
                            <span>Edit Image</span>
                          </Tooltip>
                        }
                      >
                        <Image
                          className="me-2"
                          src={mode === 'dark' ? editIconDark : editIconLight}
                          alt="Edit Image"
                          onClick={handleEditImage}
                          style={{
                            cursor: 'pointer',
                            width: '2.2rem',
                            height: '2.2rem',
                          }}
                        />
                      </OverlayTrigger>
                    )}
                    <LikeButton
                      recipe={recipeDetails}
                      docRef={doc(db, 'favorites/' + recipeDetails.id)}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-top flex-column flex-md-row">
                  <div className="d-flex align-items-center">
                    <p className="fw-bold my-2">
                      Cooking Time:{' '}
                      <span className="fw-normal ms-1">
                        {recipeDetails.time}
                      </span>
                    </p>
                    {isEditable && (
                      <Image
                        className="px-1"
                        src={mode === 'dark' ? editIconDark : editIconLight}
                        alt="Edit Title"
                        onClick={handleEditTime}
                        style={{
                          cursor: 'pointer',
                          width: '2.3rem',
                          height: '2.3rem',
                        }}
                      />
                    )}
                  </div>
                  {isEditable && editingCookingTime && (
                    <div className="d-flex align-items-center w-auto w-lg-100">
                      <InputGroup>
                        <Form.Select
                          onChange={(e) =>
                            setEditedCookingHours(e.target.value)
                          }
                          value={editedCookingHours}
                          aria-label="Select cooking hours"
                        >
                          <option value="">Hrs</option>
                          {Array.from({ length: 24 }, (_, index) => (
                            <option key={index} value={index}>
                              {index}
                            </option>
                          ))}
                        </Form.Select>
                        <InputGroup.Text>:</InputGroup.Text>
                        <Form.Select
                          onChange={(e) =>
                            setEditedCookingMinutes(e.target.value)
                          }
                          value={editedCookingMinutes}
                          aria-label="Select cooking minutes"
                        >
                          <option value="">Min</option>
                          {Array.from({ length: 60 }, (_, index) => (
                            <option key={index} value={index}>
                              {index}
                            </option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                      <Button
                        className="ms-2 fw-semibold"
                        variant="outline-dark"
                        onClick={handleSaveTime}
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
                          e.target.style.color =
                            mode === 'light' ? '#00370b' : '#63cc5a'
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        className="ms-2 fw-semibold"
                        variant="outline-danger"
                        size="md"
                        onClick={handleCancelTime}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  {cookingTimeError && (
                    <Form.Text className="text-danger">
                      {cookingTimeError}
                    </Form.Text>
                  )}
                </div>

                <div className="d-flex align-items-center">
                  <p className="fw-bold my-2">Recipe Ingredients: </p>
                  {isEditable && (
                    <Image
                      className="px-1"
                      src={mode === 'dark' ? editIconDark : editIconLight}
                      alt="Edit Title"
                      onClick={handleEditIngredients}
                      style={{
                        cursor: 'pointer',
                        width: '2.3rem',
                        height: '2.3rem',
                      }}
                    />
                  )}
                </div>
                {isEditable && editingIngredients ? (
                  <>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        as="textarea"
                        placeholder="Edit or add ingredients (separate with commas)"
                        onChange={handleIngredientsChange}
                        value={editedIngredients}
                        aria-label="Recipe Ingredients"
                        aria-describedby="RecipeIngredientsInput"
                      />
                      <Button
                        className="ms-2 fw-semibold"
                        variant="outline-dark"
                        onClick={handleSaveIngredients}
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
                          e.target.style.color =
                            mode === 'light' ? '#00370b' : '#63cc5a'
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        className="ms-2 fw-semibold"
                        variant="outline-danger"
                        size="md"
                        onClick={handleCancelIngredients}
                      >
                        Cancel
                      </Button>
                    </div>
                    <Form.Text className="mt-2">
                      Separate ingredients with commas (e.g., ingredient1,
                      ingredient2)
                    </Form.Text>
                  </>
                ) : (
                  <div>
                    {formatIngredientsForDisplay(recipeDetails.ingredients)}
                  </div>
                )}
                {ingredientsError && (
                  <Form.Text className="text-danger">
                    {ingredientsError}
                  </Form.Text>
                )}

                <div className="d-flex align-items-center">
                  <p className="fw-bold my-2">Cooking Instructions:</p>{' '}
                  {isEditable && (
                    <Image
                      className="px-1"
                      src={mode === 'dark' ? editIconDark : editIconLight}
                      alt="Edit Title"
                      onClick={handleEditMethod}
                      style={{
                        cursor: 'pointer',
                        width: '2.3rem',
                        height: '2.3rem',
                      }}
                    />
                  )}
                </div>
                {isEditable && editingMethod ? (
                  <div className="d-flex align-items-center mb-2">
                    <Form.Control
                      as="textarea"
                      placeholder="Enter cooking instructions"
                      onChange={handleMethodChange}
                      value={method}
                      aria-label="Recipe Method"
                      aria-describedby="RecipeMethodInput"
                    />
                    <Button
                      className="ms-2 fw-semibold"
                      variant="outline-dark"
                      onClick={handleSaveMethod}
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
                        e.target.style.color =
                          mode === 'light' ? '#00370b' : '#63cc5a'
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      className="ms-2 fw-semibold"
                      variant="outline-danger"
                      size="md"
                      onClick={handleCancelMethod}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <p className="mb-2">{recipeDetails.text}</p>
                )}
                {methodError && (
                  <Form.Text className="text-danger">{methodError}</Form.Text>
                )}

                {firestoreDocument ? (
                  <div className="d-flex align-items-center flex-wrap g-2">
                    <span className="fw-bold pe-1">Created by</span>{' '}
                    <span className="pe-1">Tasty Treats user </span>
                    <span className="fw-bold fs-5 pe-2">
                      {firestoreDocument.createdBy.displayName}
                    </span>
                    <Avatar
                      src={firestoreDocument.createdBy.photoURL}
                      size={40}
                      padding={false}
                      alt="User Avatar"
                    />
                  </div>
                ) : (
                  <div>
                    {recipeDetails.source !== 'Source not available' ? (
                      <a
                        href={recipeDetails.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault()
                          window.open(recipeDetails.source, '_blank')
                        }}
                        className="recipe-title"
                      >
                        <span className="fw-bold">Recipe Source</span>
                      </a>
                    ) : (
                      <span className="fw-bold text-danger fst-italic">
                        {recipeDetails.source}
                      </span>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          {/* Comment Card (on the right side on large screens, below on smaller screens) */}
          <Col lg={4} md={12}>
            <Card className="comment-card" style={{ background: commentColor }}>
              <Card.Body className="pt-2 pb-3">
                <h4 className="mb-2">Recipe Comments</h4>
                <div className="mb-3">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Image
                      key={index}
                      src={
                        index < newCommentRating
                          ? mode === 'light'
                            ? StarFilledLight
                            : StarFilledDark
                          : mode === 'light'
                          ? StarEmptyLight
                          : StarEmptyDark
                      }
                      alt={`Star ${index + 1}`}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginRight: '2px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        handleAddStarClick(index + 1)
                      }}
                      className="star-icon"
                    />
                  ))}
                </div>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add a comment..."
                    value={newCommentAdd}
                    onChange={(e) => setNewCommentAdd(e.target.value)}
                    disabled={!user}
                  />
                </Form.Group>

                <OverlayTrigger
                  trigger="click"
                  placement="bottom"
                  show={isCommentPopoverVisible}
                  onHide={() => setIsCommentPopoverVisible(false)}
                  overlay={
                    <Popover
                      id="popover-comment-error"
                      data-bs-theme={mode === 'light' ? null : 'dark'}
                    >
                      <Popover.Body>
                        Please <strong>Log in</strong> or{' '}
                        <strong>Sign up</strong> to add comments.
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <div
                    className="position-relative"
                    style={{ display: 'inline-block' }}
                  >
                    <CustomButton onClick={handleAddComment}>
                      Add Comment
                    </CustomButton>
                  </div>
                </OverlayTrigger>

                {commentAddError && (
                  <Form.Text className="d-flex text-danger">
                    {commentAddError}
                  </Form.Text>
                )}

                <ListGroup className="mt-3">
                  {sortedComments &&
                    sortedComments.map((comment) => (
                      <ListGroup.Item key={comment.id}>
                        <div className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center">
                              <Avatar
                                src={comment.addedBy.photoURL}
                                size={40}
                                padding={false}
                                alt="User Avatar"
                              />
                              <span className="ms-2">
                                {comment.addedBy.displayName}
                              </span>
                            </div>

                            <div className="d-flex align-items-center">
                              {/* Check if the user is the author */}
                              {user && comment.addedBy.id === user.uid && (
                                <>
                                  <OverlayTrigger
                                    placement="bottom"
                                    overlay={
                                      <Tooltip
                                        role="tooltip"
                                        className={tooltipClassName}
                                      >
                                        <span>Edit Comment</span>
                                      </Tooltip>
                                    }
                                  >
                                    <Image
                                      className="me-2"
                                      src={
                                        mode === 'dark'
                                          ? editIconDark
                                          : editIconLight
                                      }
                                      alt="Edit Image"
                                      onClick={() =>
                                        handleEditComment(
                                          comment.id,
                                          comment.content,
                                          comment.rating
                                        )
                                      }
                                      style={{
                                        cursor: 'pointer',
                                        width: '2rem',
                                        height: '2rem',
                                      }}
                                    />
                                  </OverlayTrigger>

                                  <OverlayTrigger
                                    placement="bottom"
                                    overlay={
                                      <Tooltip
                                        role="tooltip"
                                        className={tooltipClassName}
                                      >
                                        <span>Delete Comment</span>
                                      </Tooltip>
                                    }
                                  >
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => {
                                        // Set the comment ID to delete when the button is clicked
                                        setCommentToDelete(comment.id)
                                        setShowDeleteModal(true)
                                      }}
                                      className="p-1"
                                    >
                                      <Image
                                        aria-label="delete icon"
                                        src={
                                          mode === 'dark'
                                            ? DeleteIconDark
                                            : DeleteIconWhite
                                        }
                                        alt="delete icon"
                                        style={{
                                          width: '1.6rem',
                                          height: '1.6rem',
                                        }}
                                      />
                                    </Button>
                                  </OverlayTrigger>
                                </>
                              )}
                              {/* Delete Confirmation Modal */}
                              <Modal
                                show={showDeleteModal}
                                onHide={() => setShowDeleteModal(false)}
                                data-bs-theme={mode === 'light' ? null : 'dark'}
                                className={
                                  mode === 'light'
                                    ? 'light-theme-modal'
                                    : 'dark-theme-modal'
                                }
                              >
                                <Modal.Header>
                                  <Modal.Title>Delete Comment</Modal.Title>
                                  <CloseButton
                                    onClick={() => setShowDeleteModal(false)}
                                    aria-label="Hide"
                                    className="close-button-no-border"
                                  />
                                </Modal.Header>
                                <Modal.Body>
                                  Are you sure you want to delete this comment?
                                </Modal.Body>
                                <Modal.Footer>
                                  <Button
                                    variant="secondary"
                                    onClick={() => {
                                      setShowDeleteModal(false)
                                      // Reset the comment ID to null when the modal is closed
                                      setCommentToDelete(null)
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="danger"
                                    onClick={() => {
                                      handleDeleteComment(commentToDelete)
                                      setShowDeleteModal(false)
                                      // Reset the comment ID to null after deletion
                                      setCommentToDelete(null)
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </Modal.Footer>
                              </Modal>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              {editingCommentId === comment.id
                                ? Array.from({ length: 5 }, (_, index) => (
                                    <Image
                                      key={index}
                                      src={
                                        index < editingCommentRating
                                          ? mode === 'light'
                                            ? StarFilledLight
                                            : StarFilledDark
                                          : mode === 'light'
                                          ? StarEmptyLight
                                          : StarEmptyDark
                                      }
                                      alt={`Star ${index + 1}`}
                                      style={{
                                        width: '20px',
                                        height: '20px',
                                        marginRight: '2px',
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => {
                                        handleStarClick(index + 1)
                                      }}
                                      className="star-icon"
                                    />
                                  ))
                                : Array.from({ length: 5 }, (_, index) => (
                                    <Image
                                      key={index}
                                      src={
                                        index < comment.rating
                                          ? mode === 'light'
                                            ? StarFilledLight
                                            : StarFilledDark
                                          : mode === 'light'
                                          ? StarEmptyLight
                                          : StarEmptyDark
                                      }
                                      alt={`Star ${index + 1}`}
                                      style={{
                                        width: '20px',
                                        height: '20px',
                                        marginRight: '2px',
                                      }}
                                    />
                                  ))}
                            </div>
                            <Badge bg="secondary">
                              {formatDistanceToNow(comment.createdAt.toDate(), {
                                addSuffix: true,
                              })}
                            </Badge>
                          </div>
                          {editingCommentId === comment.id ? (
                            <>
                              <Form.Control
                                className="mb-3"
                                as="textarea"
                                rows={3}
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                              />
                              <div className="d-flex align-items-center">
                                <Button
                                  className="fw-semibold"
                                  variant="outline-dark"
                                  onClick={() =>
                                    handleEditComment(
                                      comment.id,
                                      comment.content,
                                      comment.rating
                                    )
                                  }
                                  style={{
                                    borderColor:
                                      mode === 'light' ? '#00370b' : '#63cc5a',
                                    color:
                                      mode === 'light' ? '#00370b' : '#63cc5a',
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
                                    e.target.style.backgroundColor =
                                      'transparent'
                                    e.target.style.borderColor =
                                      mode === 'light' ? '#00370b' : '#63cc5a'
                                    e.target.style.color =
                                      mode === 'light' ? '#00370b' : '#63cc5a'
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  className="ms-2 fw-semibold"
                                  variant="outline-danger"
                                  size="md"
                                  onClick={handleCancelEditComment}
                                >
                                  Cancel
                                </Button>
                              </div>
                              {commentEditError && (
                                <Form.Text className="d-flex text-danger">
                                  {commentEditError}
                                </Form.Text>
                              )}
                            </>
                          ) : (
                            <p className="mt-2">{comment.content}</p>
                          )}
                        </div>
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  )
}
