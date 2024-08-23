import { useState } from 'react'
import { useLogin } from '../../hooks/useLogin'
import { useTheme } from '../../hooks/useTheme'
import { Form, Spinner, Card, Image } from 'react-bootstrap'
import CustomButton from '../../components/CustomButton'

// styles
import './Login.css'
import FoodImg from '../../assets/foodMain.jpg'

export default function Login() {
  const { mode } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, error, isPending } = useLogin()

  const handleSubmit = (e) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="container-login">
      <div className="column">
        <div className="div1">
          <Image
            fluid
            src={FoodImg}
            alt="Food on the table"
            loading="lazy"
            className={`${mode === 'dark' ? 'food-img-dark' : 'food-img'}`}
          />
        </div>
      </div>
      <div className="column">
        <div className="div2 my-4">
          <Card
            className="px-4 py-3"
            data-bs-theme={mode === 'light' ? null : 'dark'}
          >
            <Form onSubmit={handleSubmit}>
              <h1 className="fs-2 mb-4 fw-bolder text-center">Login</h1>

              <Form.Group controlId="loginEmail" className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Enter email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  aria-label="Email address"
                  aria-describedby="emailInput"
                />
              </Form.Group>

              <Form.Group controlId="loginPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  required
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  aria-label="Password"
                  aria-describedby="passwordInput"
                />
              </Form.Group>

              <CustomButton
                className="w-100 my-3"
                type="submit"
                disabled={isPending}
              >
                {isPending && (
                  <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                )}
                {isPending ? 'Loading' : 'Login'}
              </CustomButton>

              {error && (
                <p className={mode === 'dark' ? 'text-danger' : 'text-muted'}>
                  {error}
                </p>
              )}
            </Form>
          </Card>
        </div>
      </div>
    </div>
  )
}
