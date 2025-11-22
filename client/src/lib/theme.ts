import { createTheme } from "@mui/material/styles";

/**
 * Color palette based on existing design
 */
const colors = {
  // Navy blue backgrounds
  darkNavy: "#0f172a",
  navy: "#1f2937",

  // Primary blue
  primaryBlue: "#3b82f6",
  primaryBlueDark: "#2563eb",
  primaryBlueLight: "#60a5fa",

  // Grays
  lightGray: "#f8fafc",
  gray200: "#e2e8f0",
  gray400: "#94a3b8",
  gray600: "#64748b",
  gray800: "#1e293b",

  // Semantic colors
  error: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
  info: "#3b82f6",
} as const;

/**
 * Material UI Theme
 * Configured for dark mode with custom color palette
 */
export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primaryBlue,
      dark: colors.primaryBlueDark,
      light: colors.primaryBlueLight,
      contrastText: colors.darkNavy,
    },
    secondary: {
      main: colors.gray400,
      dark: colors.gray600,
      light: colors.gray200,
    },
    background: {
      default: colors.darkNavy,
      paper: colors.navy,
    },
    text: {
      primary: colors.lightGray,
      secondary: colors.gray200,
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    success: {
      main: colors.success,
    },
    info: {
      main: colors.info,
    },
    divider: `rgba(148, 163, 184, 0.2)`,
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.15rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "0.875rem",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(10px)",
        },
      },
    },
  },
});

// Export colors for direct use if needed
export { colors };
