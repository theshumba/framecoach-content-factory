export const BRAND = {
  red: '#E32326',
  redLight: '#EC595C',
  redDark: '#9E1819',
  dark: '#141414',
  light: '#f7f7f7',
  gray: '#8E8E8E',
  white: '#ffffff',
} as const;

export const BG_COLORS = {
  dark: BRAND.dark,
  gradient: `linear-gradient(165deg, ${BRAND.redDark} 0%, ${BRAND.red} 50%, ${BRAND.redLight} 100%)`,
  light: BRAND.light,
} as const;

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
