import { Button } from 'react-bootstrap'
import { useTheme } from '../hooks/useTheme'
import { useEffect } from 'react'

export default function CustomButton({ onClick, children, ...props }) {
  const { buttonColor, buttonHoverColor } = useTheme()

  // useEffect to update styles on theme change
  useEffect(() => {
    const buttons = document.querySelectorAll('.theme-button')

    buttons.forEach((button) => {
      button.style.borderColor = buttonColor
      button.style.color = buttonColor
    })
  }, [buttonColor])

  return (
    <Button
      className="theme-button"
      variant="outline-dark"
      size="md"
      onClick={onClick}
      style={{
        borderColor: buttonColor,
        color: buttonColor,
        backgroundColor: 'transparent',
        fontWeight: '600',
      }}
      onMouseOver={(e) => {
        e.target.style.backgroundColor = buttonHoverColor
        e.target.style.borderColor = buttonHoverColor
        e.target.style.color = '#fff'
      }}
      onMouseOut={(e) => {
        e.target.style.backgroundColor = 'transparent'
        e.target.style.borderColor = buttonColor
        e.target.style.color = buttonColor
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
