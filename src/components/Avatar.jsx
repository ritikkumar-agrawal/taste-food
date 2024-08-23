import { Image } from 'react-bootstrap'
import { useTheme } from '../hooks/useTheme'

//styles & images
import './Avatar.css'

export default function Avatar({ src, size = 50, padding = true }) {
  const { mode } = useTheme()
  const avatarClassName = `d-flex align-items-center justify-content-center ${
    padding ? 'py-3' : 'p-0'
  }`

  return (
    <div className={avatarClassName}>
      <Image
        src={
          src ||
          'https://firebasestorage.googleapis.com/v0/b/tasty-treats-site.appspot.com/o/thumbnails%2Fdefault%2FnoAvatar.png?alt=media&token=7525b0ff-7ae7-4435-a5f1-6fdf2f8dc67a'
        }
        alt="user avatar image"
        roundedCircle
        width={size}
        height={size}
        className={mode === 'dark' ? 'avatar-img-dark' : 'avatar-img'}
      />
    </div>
  )
}
