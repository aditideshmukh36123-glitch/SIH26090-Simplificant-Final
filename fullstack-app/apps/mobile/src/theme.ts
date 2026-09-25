export const colors = {
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  secondary: "#D97706",
  surface: "#FFFFFF",
  background: "#F9FAFB",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  white: "#FFFFFF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
};

export const typography = {
  title: { fontSize: 22, fontWeight: "700" as const },
  heading: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 15 },
  caption: { fontSize: 12, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: "600" as const },
};