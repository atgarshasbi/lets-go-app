import { createContext, useContext } from 'react';

export const THEMES = {
  purple: { primary: '#7c3aed', hover: '#6d28d9', light: '#ede9fe', border: '#c4b5fd' },
  blue:   { primary: '#2563eb', hover: '#1d4ed8', light: '#dbeafe', border: '#93c5fd' },
  green:  { primary: '#16a34a', hover: '#15803d', light: '#dcfce7', border: '#86efac' },
  pink:   { primary: '#db2777', hover: '#be185d', light: '#fce7f3', border: '#f9a8d4' },
  orange: { primary: '#ea580c', hover: '#c2410c', light: '#ffedd5', border: '#fdba74' },
  teal:   { primary: '#0d9488', hover: '#0f766e', light: '#ccfbf1', border: '#5eead4' },
};

export const CHARACTERS = {
  trophy:    { emoji: '🏆', label: 'Trophy' },
  unicorn:   { emoji: '🦄', label: 'Unicorn' },
  superboy:  { emoji: '🦸‍♂️', label: 'Super Boy' },
  supergirl: { emoji: '🦸‍♀️', label: 'Super Girl' },
  crown:     { emoji: '👑', label: 'Royal' },
  rocket:    { emoji: '🚀', label: 'Rocket' },
};

export const ThemeContext = createContext(THEMES.purple);
export const useTheme = () => useContext(ThemeContext);

export const SoundContext = createContext(true);
export const useSound = () => useContext(SoundContext);

export const DarkModeContext = createContext([false, () => {}]);
export const useDarkMode = () => useContext(DarkModeContext);
