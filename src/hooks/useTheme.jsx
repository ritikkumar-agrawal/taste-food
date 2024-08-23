import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'
import { useState } from 'react'
import {
  themeColorsLight,
  themeColorsDark,
  themeColorsButtonLight,
  themeColorsButtonDark,
  themeColorsButtonHoverLight,
  themeColorsButtonHoverDark,
  themeColorsCardLight,
  themeColorsCardDark,
  themeColorsCommentLight,
  themeColorsCommentDark,
  themeColorsFooterLight,
  themeColorsFooterDark,
} from '../components/ColorSelector'

export const useTheme = () => {
  const context = useContext(ThemeContext)
  //if useContext outside its scope if forgot to wrap all the components using it
  if (context === undefined) {
    throw new Error('useTheme() must be used inside a ThemeProvider')
  }

  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [selectedButtonColorIndex, setSelectedButtonColorIndex] = useState(0)
  const [selectedButtonHoverColorIndex, setSelectedButtonHoverColorIndex] =
    useState(0)
  const [selectedCardColorIndex, setSelectedCardColorIndex] = useState(0)
  const [selectedCommentColorIndex, setSelectedCommentColorIndex] = useState(0)
  const [selectedFooterColorIndex, setSelectedFooterColorIndex] = useState(0)

  const getColor = () => {
    const mode = context.mode
    const colors = mode === 'light' ? themeColorsLight : themeColorsDark
    return colors[selectedColorIndex]
  }

  const getButtonColor = () => {
    const mode = context.mode
    const colors =
      mode === 'light' ? themeColorsButtonLight : themeColorsButtonDark
    return colors[selectedButtonColorIndex]
  }

  const getButtonHoverColor = () => {
    const mode = context.mode
    const colors =
      mode === 'light'
        ? themeColorsButtonHoverLight
        : themeColorsButtonHoverDark
    return colors[selectedButtonHoverColorIndex]
  }

  const getCardColor = () => {
    const mode = context.mode
    const colors = mode === 'light' ? themeColorsCardLight : themeColorsCardDark
    return colors[selectedCardColorIndex]
  }

  const getCommentColor = () => {
    const mode = context.mode
    const colors =
      mode === 'light' ? themeColorsCommentLight : themeColorsCommentDark
    return colors[selectedCommentColorIndex]
  }

  const getFooterColor = () => {
    const mode = context.mode
    const colors =
      mode === 'light' ? themeColorsFooterLight : themeColorsFooterDark
    return colors[selectedFooterColorIndex]
  }

  return {
    ...context,
    selectedColorIndex,
    setSelectedColorIndex,
    getColor,
    selectedButtonColorIndex,
    setSelectedButtonColorIndex,
    getButtonColor,
    selectedButtonHoverColorIndex,
    setSelectedButtonHoverColorIndex,
    getButtonHoverColor,
    selectedCardColorIndex,
    setSelectedCardColorIndex,
    getCardColor,
    selectedCommentColorIndex,
    setSelectedCommentColorIndex,
    getCommentColor,
    selectedFooterColorIndex,
    setSelectedFooterColorIndex,
    getFooterColor,
  }
}
