import React from "react";
import { AppBar, TitlePortal } from "react-admin";
import HomeIcon from "@mui/icons-material/Home";
import { Button, IconButton } from "@mui/material";

import { navigateToBaseRoute, useBaseRoute } from "../utils/routeUtility";

const goToDashboard = () => navigateToBaseRoute();

export default (props) => {
  const baseRoute = useBaseRoute();
  const showBackToDashboard = Boolean(baseRoute);

  return (
    <AppBar
      sx={{
        "& .RaAppBar-menuButton": {
          display: "",
        },
        "& .RaAppBar-menuButton svg": {
          color: (theme) => theme.palette.primary.main,
        },
      }}
      elevation={2}
      {...props}
    >
      <TitlePortal />
      {showBackToDashboard && (
        <>
          <IconButton
            color="primary"
            aria-label="Back to Dashboard"
            onClick={goToDashboard}
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
          >
            <HomeIcon />
          </IconButton>
          <Button
            color="primary"
            startIcon={<HomeIcon />}
            onClick={goToDashboard}
            size="small"
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          >
            Back to Home
          </Button>
        </>
      )}
    </AppBar>
  );
};
