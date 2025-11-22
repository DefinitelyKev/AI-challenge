import { Box, AppBar, Toolbar, Typography, Button, Drawer, IconButton } from "@mui/material";
import { Settings as SettingsIcon, Close as CloseIcon } from "@mui/icons-material";
import { useState } from "react";
import ChatPage from "./pages/ChatPage";
import ConfigurePage from "./pages/ConfigurePage";
import { useChat } from "./hooks";
import { logger } from "./lib/logger";
import { colors, styleUtils } from "./lib/theme";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lift chat state to App level to persist
  const chatState = useChat();

  const handleOpenDrawer = () => {
    logger.userInteraction("open_drawer", "navigation", { drawer: "configure" });
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    logger.userInteraction("close_drawer", "navigation", { drawer: "configure" });
    setDrawerOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #1C1917 0%, #292524 100%)",
        overflow: "hidden",
      }}
    >
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.01em",
              ...styleUtils.gradientText,
            }}
          >
            Legal Frontdoor
          </Typography>

          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleOpenDrawer}
            sx={{
              borderColor: colors.alpha.primary[30],
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: colors.alpha.primary[8],
              },
            }}
          >
            Configure
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          marginRight: drawerOpen ? { xs: 0, sm: "500px", md: "600px" } : 0,
        }}
      >
        <ChatPage chatState={chatState} />
      </Box>

      {/* Configuration Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        variant="persistent"
        transitionDuration={300}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 500, md: 600 },
            background: "linear-gradient(180deg, #1C1917 0%, #292524 100%)",
            borderLeft: `1px solid ${colors.alpha.primary[20]}`,
            boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.55,
            borderBottom: `1px solid ${colors.alpha.white[10]}`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              ...styleUtils.gradientText,
            }}
          >
            Configuration
          </Typography>
          <IconButton
            onClick={handleCloseDrawer}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                backgroundColor: colors.alpha.white[5],
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Drawer Content */}
        <ConfigurePage />
      </Drawer>
    </Box>
  );
}
