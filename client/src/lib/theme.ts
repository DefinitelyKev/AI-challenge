import { createTheme } from "@mui/material/styles";

const colors = {
  // Backgrounds - Warm charcoal and brown tones
  deepWarmGray: "#1C1917", // stone-900
  warmGray: "#292524", // stone-800
  mediumWarmGray: "#44403C", // stone-700
  lightWarmGray: "#57534E", // stone-600

  // Accents - Amber and coral
  primaryAccent: "#FB923C", // orange-400
  secondaryAccent: "#FDBA74", // orange-300
  tertiaryAccent: "#FCD34D", // amber-300

  // Text colors
  primaryText: "#FAFAF9", // stone-50
  secondaryText: "#D6D3D1", // stone-300
  mutedText: "#A8A29E", // stone-400

  // Semantic
  success: "#34D399", // emerald-400
  warning: "#FBBF24", // amber-400
  error: "#F87171", // red-400

  // Alpha variants - For consistent transparency
  alpha: {
    primary: {
      5: "rgba(251, 146, 60, 0.05)",
      8: "rgba(251, 146, 60, 0.08)",
      12: "rgba(251, 146, 60, 0.12)",
      15: "rgba(251, 146, 60, 0.15)",
      20: "rgba(251, 146, 60, 0.2)",
      25: "rgba(251, 146, 60, 0.25)",
      30: "rgba(251, 146, 60, 0.3)",
      35: "rgba(251, 146, 60, 0.35)",
    },
    card: "rgba(68, 64, 60, 0.9)",
    cardLight: "rgba(68, 64, 60, 0.85)",
    cardDark: "rgba(68, 64, 60, 0.95)",
    messageContainer: "rgba(57, 53, 50, 0.5)",
    messageContainerLight: "rgba(41, 37, 36, 0.3)",
    white: {
      1: "rgba(255, 255, 255, 0.01)",
      2: "rgba(255, 255, 255, 0.02)",
      5: "rgba(255, 255, 255, 0.05)",
      10: "rgba(255, 255, 255, 0.1)",
      15: "rgba(255, 255, 255, 0.15)",
    },
  },
} as const;

/**
 * Reusable style utilities
 */
export const styleUtils = {
  // Scrollbar styling for consistent scrollbars across the app
  scrollbar: {
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: colors.alpha.white[5],
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: colors.alpha.white[10],
      borderRadius: "4px",
      "&:hover": {
        backgroundColor: colors.alpha.white[15],
      },
    },
  },

  // Gradient text effect for headings
  gradientText: {
    background: "linear-gradient(135deg, #FAFAF9 0%, #FDBA74 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
} as const;

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primaryAccent,
      light: colors.secondaryAccent,
      dark: colors.tertiaryAccent,
      contrastText: colors.primaryText,
    },
    secondary: {
      main: colors.mutedText,
      light: colors.secondaryText,
      dark: colors.lightWarmGray,
    },
    error: {
      main: colors.error,
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    background: {
      default: colors.deepWarmGray,
      paper: colors.warmGray,
    },
    text: {
      primary: colors.primaryText,
      secondary: colors.secondaryText,
    },
    divider: "rgba(250, 250, 249, 0.12)",
  },
  typography: {
    fontFamily: '"Open Sans", "Inter", -apple-system, "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      fontSize: "1.5rem",
    },
    h4: {
      fontWeight: 600,
      letterSpacing: "0em",
      fontSize: "1.25rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.125rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
      fontSize: "1rem",
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.5,
      fontSize: "0.875rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
    },
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: "0.95rem",
          fontWeight: 600,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(251, 146, 60, 0.3)",
          },
        },
        contained: {
          boxShadow: "0 2px 8px rgba(251, 146, 60, 0.2)",
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: colors.warmGray,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        },
        elevation2: {
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.warmGray,
          borderRadius: 12,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(251, 146, 60, 0.15)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.secondaryAccent,
              },
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: "2px",
              },
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(250, 250, 249, 0.12)",
        },
        indicator: {
          height: 3,
          borderRadius: "3px 3px 0 0",
          backgroundColor: colors.primaryAccent,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          minHeight: 56,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            color: colors.secondaryAccent,
            backgroundColor: "rgba(251, 146, 60, 0.08)",
          },
          "&.Mui-selected": {
            color: colors.primaryText,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: `${colors.deepWarmGray}F0`,
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(250, 250, 249, 0.12)",
        },
      },
    },
  },
});

// Export colors for direct use if needed
export { colors };
