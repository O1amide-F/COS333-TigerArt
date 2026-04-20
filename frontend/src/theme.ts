const colors = {
  bg: "#f0ede9", // background color for the app
  surface: "#F2F1EE",
  border: "#E0DED9",
  text: "#1A1A18",
  muted_orange: "#7d471f",
  accent: "#1A1A18",
  navy: "#0F1923",
  white: "#FFFFFF",
  card_color: "#e3a06f",
  danger: "#E53935",
  placeholderGradientEnd: "#E8E6E1",
  imageBg: "#d8d5d0",
  black: "#000000",
} as const;

export const theme = {
  colors,
  components: {
    nav: {
      background: colors.navy,
      icon: colors.white,
      inactiveOpacity: 0.4,
    },
    button: {
      ghostBackground: "none",
      ghostBorder: "none",
      primaryBackground: colors.navy,
      primaryText: colors.white,
      disabledBackground: colors.surface,
      disabledText: colors.muted_orange,
    },
    favorites_card: {
      background: colors.white,
      border: colors.border,
    },
    card: {
      background: colors.card_color,
      border: colors.border,
    },
    badge: {
      background: colors.surface,
      text: colors.text,
      mutedText: colors.muted_orange,
    },
    input: {
      background: colors.bg,
      border: colors.border,
      text: colors.text,
      mutedText: colors.muted_orange,
    },
    favorite: {
      active: colors.danger,
      inactive: colors.border,
    },
    placeholder: {
      gradientStart: colors.surface,
      gradientEnd: colors.placeholderGradientEnd,
      label: colors.muted_orange,
    },
    divider: {
      color: colors.border,
    },
    image: {
      background: colors.imageBg,
      newsBackground: colors.black,
    },
  },
} as const;
