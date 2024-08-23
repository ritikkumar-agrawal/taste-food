import { useTheme } from '../hooks/useTheme'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'

//styles
import './ThemeSelector.css'

export default function ThemeSelector() {
  const { changeMode, mode } = useTheme()

  const toggleMode = () => {
    changeMode(mode === 'light' ? 'dark' : 'light')
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(mode)
  }

  const tooltipClassName = `'tooltip' ${mode === 'light' ? '' : 'darkTooltip'}`

  return (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip role="tooltip" className={tooltipClassName}>
          <span>Switch to {mode === 'light' ? ' dark ' : 'light'} theme</span>
        </Tooltip>
      }
    >
      <Button
        onClick={toggleMode}
        variant="outline-none"
        size="md"
        className={`rounded-circle p-2 ${
          mode === 'light' ? 'theme-toggle' : 'theme-toggle-dark'
        }`}
      >
        <svg
          className={mode === 'light' ? 'switcher' : 'switcher-dark'}
          xmlns="http://www.w3.org/2000/svg"
          width="472.39"
          height="472.39"
          viewBox="0 0 472.39 472.39"
        >
          <g className={mode === 'light' ? 'toggle-sun' : 'toggle-sun-dark'}>
            <path d="M403.21,167V69.18H305.38L236.2,0,167,69.18H69.18V167L0,236.2l69.18,69.18v97.83H167l69.18,69.18,69.18-69.18h97.83V305.38l69.18-69.18Zm-167,198.17a129,129,0,1,1,129-129A129,129,0,0,1,236.2,365.19Z" />
          </g>
          <g
            className={
              mode === 'light' ? 'toggle-circle' : 'toggle-circle-dark'
            }
          >
            <circle className="cls-1" cx="236.2" cy="236.2" r="103.78" />
          </g>
        </svg>
      </Button>
    </OverlayTrigger>
  )
}
