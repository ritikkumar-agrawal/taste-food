import { useTheme } from '../hooks/useTheme'
import { Button, Image, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useEffect } from 'react'

//styles
import './ColorSelector.css'
import colorPaletteFilledLight from '../assets/colorPalette_filledLight.svg'
import colorPaletteFilledDark from '../assets/colorPalette_filledDark.svg'

export const themeColorsLight = [
  // Sunset Glow
  'linear-gradient(135deg, #ffdd87, #ff8900)',
  // Ocean Breeze
  'linear-gradient(135deg, #c7e9fb, #2c7da0)',
  // Minty Fresh
  'linear-gradient(135deg, #cbe6c9, #53b346)',
]

export const themeColorsDark = [
  // Ember Flame
  'linear-gradient(135deg, #562b00, #240b00)',
  // Midnight Sky
  'linear-gradient(135deg, #1a394f, #002133)',
  // Enchanted Forest
  'linear-gradient(135deg, #1c4e17, #002408)',
]

const colorNamesLight = ['Sunset Glow', 'Ocean Breeze', 'Minty Fresh']
const colorNamesDark = ['Ember Flame', 'Midnight Sky', 'Enchanted Forest']

export const themeColorsButtonLight = [
  // Ember Flame
  '#001e38',
  // Midnight Sky
  '#2d4262',
  // Enchanted Forest
  '#00370b',
]

export const themeColorsButtonDark = [
  // Sunset Glow
  '#ff8900',
  // Ocean Breeze
  '#288fb3',
  // Minty Fresh
  '#63cc5a',
]

export const themeColorsButtonHoverLight = [
  // Ember Flame
  '#001527',
  // Midnight Sky
  '#1f3045',
  // Enchanted Forest
  '#002a09',
]

export const themeColorsButtonHoverDark = [
  // Sunset Glow
  '#ff6a00',
  // Ocean Breeze
  '#1e6b8a',
  // Minty Fresh
  '#4eaf47',
]

export const themeColorsCardLight = [
  // Sunset Glow
  '#ffe6b3',
  // Ocean Breeze
  '#b3e0f7',
  // Minty Fresh
  '#cdeed9',
]

export const themeColorsCardDark = [
  // Ember Flame
  '#3d1f00',
  // Midnight Sky
  '#001a33',
  // Enchanted Forest
  '#214d21',
]

export const themeColorsCommentLight = [
  // Warm Ivory
  '#FFECBF',
  //Light Ocean
  '#D5EBF2',
  // FreshGreen
  '#C9EFD3',
]

export const themeColorsCommentDark = [
  // Rich Brown
  '#432E1F',
  // Deep Ocean
  '#1A2B3A',
  // Forest Green
  '#1D4221',
]

export const themeColorsFooterLight = [
  // Sunset Glow
  '#ffdd87',
  // Ocean Breeze
  '#c7e9fb',
  // Minty Fresh
  '#cbe6c9',
]

export const themeColorsFooterDark = [
  // Ember Flame
  '#562b00',
  // Midnight Sky
  '#1a394f',
  // Enchanted Forest
  '#1c4e17',
]

export default function ColorSelector() {
  const {
    mode,
    changeColor,
    selectedColorIndex,
    setSelectedColorIndex,
    getColor,
    changeButtonColor,
    selectedButtonColorIndex,
    setSelectedButtonColorIndex,
    getButtonColor,
    changeButtonHoverColor,
    selectedButtonHoverColorIndex,
    setSelectedButtonHoverColorIndex,
    getButtonHoverColor,
    changeCardColor,
    selectedCardColorIndex,
    setSelectedCardColorIndex,
    getCardColor,
    changeCommentColor,
    selectedCommentColorIndex,
    setSelectedCommentColorIndex,
    getCommentColor,
    changeFooterColor,
    selectedFooterColorIndex,
    setSelectedFooterColorIndex,
    getFooterColor,
  } = useTheme()

  const tooltipClassName = `'tooltip' ${mode === 'light' ? '' : 'darkTooltip'}`
  const themeColors = mode === 'light' ? themeColorsLight : themeColorsDark
  const colorNames = mode === 'light' ? colorNamesLight : colorNamesDark

  useEffect(() => {
    // Get the current color for the selected color index and mode
    const newColor = getColor(selectedColorIndex)
    changeColor(newColor)

    const newButtonColor = getButtonColor(selectedButtonColorIndex)
    changeButtonColor(newButtonColor)

    const newButtonHoverColor = getButtonHoverColor(
      selectedButtonHoverColorIndex
    )
    changeButtonHoverColor(newButtonHoverColor)

    const newCardColor = getCardColor(selectedCardColorIndex)
    changeCardColor(newCardColor)

    const newCommentColor = getCommentColor(selectedCommentColorIndex)
    changeCommentColor(newCommentColor)

    const newFooterColor = getFooterColor(selectedFooterColorIndex)
    changeFooterColor(newFooterColor)
  }, [
    mode,
    selectedColorIndex,
    selectedButtonColorIndex,
    selectedButtonHoverColorIndex,
    selectedCardColorIndex,
    selectedCommentColorIndex,
    selectedFooterColorIndex,
  ])

  const handleColorButtonClick = (index) => {
    setSelectedColorIndex(index)
    setSelectedButtonColorIndex(index)
    setSelectedButtonHoverColorIndex(index)
    setSelectedCardColorIndex(index)
    setSelectedCommentColorIndex(index)
    setSelectedFooterColorIndex(index)
    const newColor = getColor()
    changeColor(newColor)
    const newButtonColor = getButtonColor()
    changeButtonColor(newButtonColor)
    const newButtonHoverColor = getButtonHoverColor()
    changeButtonHoverColor(newButtonHoverColor)
    const newCardColor = getCardColor()
    changeCardColor(newCardColor)
    const newCommentColor = getCommentColor()
    changeCommentColor(newCommentColor)
    const newFooterColor = getFooterColor()
    changeFooterColor(newFooterColor)
  }

  return (
    <div
      className={`d-flex p-2 gap-2 align-items-center ps-lg-2`}
      data-bs-theme={mode === 'light' ? null : 'dark'}
    >
      {themeColors.map((color, index) => (
        <OverlayTrigger
          key={color}
          placement="bottom"
          overlay={
            <Tooltip role="tooltip" className={tooltipClassName}>
              <span>Switch to {colorNames[index]}</span>
            </Tooltip>
          }
        >
          <Button
            onClick={() => handleColorButtonClick(index)}
            variant={`outline-${mode === 'light' ? 'dark' : 'light'}`}
            size="md"
            className="theme-toggle-colorSelect rounded-circle d-flex align-items-center justify-content-center"
            style={{ background: color }}
            aria-label={`Color Option ${index + 1}`}
          >
            <Image
              src={
                mode === 'light'
                  ? colorPaletteFilledLight
                  : colorPaletteFilledDark
              }
              className="color-icon"
              alt={`Color Palette ${index + 1}`}
            />
          </Button>
        </OverlayTrigger>
      ))}
    </div>
  )
}
