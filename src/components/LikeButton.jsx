import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Button, Image, OverlayTrigger, Popover } from 'react-bootstrap'
import { useGlobalContext } from '../context/AppContext'
import { useAuthContext } from '../hooks/useAuthContext'

// styles
import './LikeButton.css'
import UnLikeLight from '../assets/likeLight.svg'
import UnLikeDark from '../assets/likeDark.svg'
import LikeLight from '../assets/likeFilledLight.svg'
import LikeDark from '../assets/likeFilledDark.svg'

export default function LikeButton({ recipe, docRef }) {
  const { mode } = useTheme()
  const { user } = useAuthContext()
  const { favoriteRecipes, toggleFavorite } = useGlobalContext()
  const [isPopoverVisible, setIsPopoverVisible] = useState(false)

  const isFavorite = favoriteRecipes
    ? favoriteRecipes.some(
        (fav) =>
          (fav.idMeal === recipe.idMeal || fav.idMeal === recipe.id) &&
          fav.addedBy?.id === user?.uid
      )
    : false

  const handleToggleFavorite = async () => {
    const idToUse = recipe.idMeal || recipe.id || null

    if (!user) {
      setIsPopoverVisible(!isPopoverVisible)
      if (process.env.NODE_ENV !== 'production') {
        console.warn('User not logged in.')
      }
      return
    }

    await toggleFavorite(docRef, idToUse)
  }

  return (
    <div>
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        show={isPopoverVisible}
        onHide={() => setIsPopoverVisible(false)}
        overlay={
          <Popover
            id="popover-login-signup"
            data-bs-theme={mode === 'light' ? null : 'dark'}
          >
            <Popover.Body>
              Please <strong>Log in</strong> or <strong>Sign up</strong> to like
              recipes.
            </Popover.Body>
          </Popover>
        }
      >
        <Button
          variant="transparent"
          size="md"
          onClick={handleToggleFavorite}
          className={`rounded-circle like-button p-2 ${
            isFavorite ? 'liked' : 'unliked'
          }`}
        >
          <Image
            src={
              isFavorite
                ? mode === 'light'
                  ? LikeLight
                  : LikeDark
                : mode === 'light'
                ? UnLikeLight
                : UnLikeDark
            }
            alt="Heart icon"
            className="like-icon"
          />
        </Button>
      </OverlayTrigger>
    </div>
  )
}
