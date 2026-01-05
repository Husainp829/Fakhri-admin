import React, { useState } from "react";
import { AppBar, TitlePortal } from "react-admin";
import Box from "@mui/material/Box";
import EventIcon from "@mui/icons-material/Event";
import IconButton from "@mui/material/IconButton";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";

import { navigateToBaseRoute } from "../utils/routeUtility";

export default (props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
      <Button onClick={() => navigateToBaseRoute()}>
        <img src="/logo.png" alt="logo" width="50px" />
      </Button>
      <TitlePortal />
      <Box>
        <IconButton
          color="primary"
          aria-label="dashboard-menu"
          component="label"
          onClick={handleClick}
        >
          <EventIcon />
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              navigateToBaseRoute();
            }}
          >
            Dashboard
          </MenuItem>
        </Menu>
      </Box>
    </AppBar>
  );
};
