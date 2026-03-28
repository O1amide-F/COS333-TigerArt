const colors = {
  bg: "#FAFAF8",
  surface: "#F2F1EE",
  border: "#E0DED9",
  text: "#1A1A18",
  muted: "#888882",
  accent: "#1A1A18",
  navy: "#0F1923",
  white: "#FFFFFF",
  danger: "#E53935",
  placeholderGradientEnd: "#E8E6E1",
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
      disabledText: colors.muted,
    },
    card: {
      background: colors.white,
      border: colors.border,
    },
    badge: {
      background: colors.surface,
      text: colors.text,
      mutedText: colors.muted,
    },
    input: {
      background: colors.bg,
      border: colors.border,
      text: colors.text,
      mutedText: colors.muted,
    },
    favorite: {
      active: colors.danger,
      inactive: colors.border,
    },
    placeholder: {
      gradientStart: colors.surface,
      gradientEnd: colors.placeholderGradientEnd,
      label: colors.muted,
    },
    divider: {
      color: colors.border,
    },
  },
} as const;
