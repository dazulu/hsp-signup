export const colors = {
  primary: "#4A6CF7",

  textPrimary: "#1a1f36",
  textMuted: "#6b7a99",
  textBrand: "#505f94",
  textOnPrimary: "#ffffff",
  textPlaceholder: "#b0b8c9",

  surface: "#ffffff",
  surfaceInput: "#f4f6fb",

  border: "#e8ecf4",
  borderStrong: "#c4cad8",

  surfaceDisabled: "#a0aec0",

  successBackground: "#eef7ee",
  successText: "#2e7d32",
  errorBackground: "#fdecea",
  errorText: "#c62828",

  warningBackground: "#fff7ed",
  warningText: "#d97706",
} as const;

export const radii = {
  xs: 3,
  sm: 5,
  md: 14,
  lg: 16,
  xl: 24,
} as const;

// Keys equal their pixel value: space[16] === 16
export const space = {
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  28: 28,
  32: 32,
  40: 40,
} as const;

export const fontFamily = {
  regular: "jakarta-400",
  medium: "jakarta-500",
  semibold: "jakarta-600",
  bold: "jakarta-700",
  extrabold: "jakarta-800",
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 14,
  body: 15,
  lg: 16,
  xl: 20,
  "2xl": 22,
  "3xl": 36,
} as const;

export const shadows = {
  card: {
    shadowColor: "#8ba4e8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: "#8ba4e8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const theme = {
  colors,
  radii,
  space,
  fontFamily,
  fontSize,
  shadows,
} as const;

export type Theme = typeof theme;
