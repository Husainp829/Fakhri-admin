import type { ReactElement } from "react";
import { AppBar, TitlePortal } from "react-admin";
import type { AppBarProps } from "react-admin";
import HomeIcon from "@mui/icons-material/Home";
import { Button, IconButton } from "@mui/material";

import { navigateToBaseRoute, useBaseRoute } from "@/utils/route-utility";

const goToDashboard = (): void => navigateToBaseRoute(null);

const LayoutAppBar = (props: AppBarProps): ReactElement => {
  const baseRoute = useBaseRoute();
  const showBackToDashboard = Boolean(baseRoute);

  return (
    <AppBar
      sx={{
        "& .RaAppBar-menuButton": {
          display: "",
        },
      }}
      elevation={2}
      {...props}
    >
      <TitlePortal />
      {showBackToDashboard && (
        <>
          <IconButton
            color="inherit"
            aria-label="Back to Dashboard"
            onClick={goToDashboard}
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
          >
            <HomeIcon />
          </IconButton>
          <Button
            color="inherit"
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

export default LayoutAppBar;
