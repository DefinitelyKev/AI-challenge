import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box, AppBar, Toolbar, Typography, Tabs, Tab } from "@mui/material";
import ChatPage from "./pages/ChatPage";
import ConfigurePage from "./pages/ConfigurePage";
import { theme } from "./lib/theme";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on current route
  const currentTab = location.pathname.startsWith("/configure") ? "/configure" : "/chat";

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "radial-gradient(circle at top, #1f2937, #0f172a)",
        }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h4" component="h1">
              Legal frontdoor
            </Typography>
            <Tabs value={currentTab} onChange={handleTabChange} textColor="inherit">
              <Tab label="Chat" value="/chat" />
              <Tab label="Configure" value="/configure" />
            </Tabs>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/configure" element={<ConfigurePage />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
