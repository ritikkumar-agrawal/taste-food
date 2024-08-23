import { Container, Row, Col, Image } from 'react-bootstrap'
import NotFoundLight from '../../assets/NotFoundLight.png'
import NotFoundDark from '../../assets/NotFoundDark.png'
import { useTheme } from '../../hooks/useTheme'
import { useNavigate } from 'react-router-dom'
import CustomButton from '../../components/CustomButton'

// styles
import './notFound.css'

export default function NotFound() {
  const { mode } = useTheme()
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Container
      className="not-found-container text-center d-flex align-items-center justify-content-center"
      data-bs-theme={mode === 'light' ? null : 'dark'}
    >
      <Row className="d-flex flex-column my-4">
        <Col xs={12} md={7} className="align-self-center">
          <Image
            src={mode === 'light' ? NotFoundLight : NotFoundDark}
            alt="Page Not Found Error"
            fluid
            className="shrinking-image"
          />
        </Col>
        <Col
          xs={12}
          md={7}
          className="align-self-center text-center fw-semi-bold"
        >
          <h2>
            <span className="text-danger">Oops!</span> Page not found.
          </h2>
          <p>We're sorry, but the page you are looking for does not exist.</p>
          <p>Please check the URL or return to the homepage.</p>
          <CustomButton onClick={handleGoHome}>Return to Homepage</CustomButton>
        </Col>
      </Row>
    </Container>
  )
}
