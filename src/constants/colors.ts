const dark = "#111827";
const light = "#ffffff";
const secondaryDark = "#1f2937";
const secondaryLight = "#f3f4f6";

export const Colors = {
  primary: "#3b82f6",
  background: {
    primary: {
      dark,
      light,
    },
    secondary: {
      dark: secondaryDark,
      light: secondaryLight,
    },
  },
  border: {
    light: "#e5e7eb",
    dark: "#374151",
  },
  inverted: {
    dark: light,
    light: dark,
  },
  black: "#000000",
} as const;
