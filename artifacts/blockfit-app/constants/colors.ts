const darkPalette = {
  text: "#FFFFFF",
  tint: "#FF5722",

  background: "#000000",
  backgroundSecondary: "#0A0A0A",
  foreground: "#FFFFFF",

  card: "#111111",
  cardSecondary: "#1A1A1A",
  cardForeground: "#FFFFFF",

  primary: "#FF5722",
  primaryForeground: "#000000",

  secondary: "#1A1A1A",
  secondaryForeground: "#FF5722",

  muted: "#262626",
  mutedForeground: "#A3A3A3",

  accent: "#FF7043",
  accentForeground: "#000000",

  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",

  border: "#262626",
  input: "#1A1A1A",
  ringTrack: "#333333",
  shadow: "#FF5722",
  success: "#FF5722",
  warning: "#FF9800",
  overlay: "rgba(0, 0, 0, 0.8)",
  gradientBackground: ["#000000", "#050505", "#0A0A0A"] as [string, string, string],
  gradientCard: ["#111111", "#0A0A0A"] as [string, string],
  gradientHero: ["rgba(255, 87, 34, 0.15)", "rgba(255, 87, 34, 0.05)", "#050505"] as [string, string, string],
  gradientAccent: ["#FF5722", "#FF7043"] as [string, string],
  glow: "rgba(255, 87, 34, 0.3)",
  glowSecondary: "rgba(255, 112, 67, 0.2)",
};

const colors = {
  light: darkPalette,
  dark: darkPalette,
  radius: 18,
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  typography: {
    title: 30,
    heading: 22,
    subheading: 16,
    body: 14,
    caption: 12,
  },
};

export default colors;
