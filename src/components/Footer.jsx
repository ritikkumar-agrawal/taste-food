import { Container, Image } from 'react-bootstrap'
import { useTheme } from '../hooks/useTheme'

//styles & images
import './Footer.css'
import heartLight from '../assets/heartLight.svg'
import heartDark from '../assets/heartDark.svg'

export default function Footer() {
  const { mode, footerColor } = useTheme()

  // Get the text color class based on the mode
  const textColorClass = mode === 'light' ? '#D3D3D3' : '#3C3C3C'

  //get the current year
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={`footer py-2 d-flex align-items-center justify-content-center ${textColorClass}`}
      style={{
        backgroundColor: footerColor,
      }}
      data-bs-theme={mode === 'light' ? null : 'dark'}
    >
      <Container className="footer-container d-flex align-items-center justify-content-center">
        <p className="text-center mb-0">
          Made with
          <Image
            className={`mx-1 footer-img ${
              mode === 'dark' ? 'footer-img-dark' : ''
            }`}
            src={mode === 'light' ? heartLight : heartDark}
            alt="Heart Icon"
          />
          by Elena Shatalova &copy; {currentYear}
        </p>
      </Container>
    </footer>
  )
}
