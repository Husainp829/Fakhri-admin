/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Logout,
  UserMenu,
  useSidebarState,
  useDataProvider,
  useNotify,
  usePermissions,
  Button,
} from "react-admin";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EventIcon from "@mui/icons-material/Event";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBack";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import { ListItemIcon, ListItemText } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { goToEvent, goToDashboard } from "../utils";
import { EventContext } from "../dataprovider/eventProvider";
import Logo from "../assets/logo.png";

export default (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { permissions } = usePermissions();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const dataProvider = useDataProvider();
  const { events, setEvents, currentEventId, currentEvent, setEventsLoading } =
    useContext(EventContext);
  const [current, setCurrent] = useState("Dashboard");
  const notify = useNotify();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const activeEvents = [];
  events.map((e) => {
    if (dayjs(e.toDate) > dayjs()) {
      activeEvents.push(e);
    }
    return e;
  });

  useEffect(() => {
    setEventsLoading(true);
    dataProvider
      .getList("events", {
        sort: { order: "ASC", field: "fromDate" },
        pagination: { page: 1, perPage: 999 },
      })
      .then(({ data }) => {
        setEvents(data);
      })
      .catch((error) => {
        notify(error);
      })
      .finally(() => {
        setEventsLoading(false);
      });
  }, []);

  const [open, setOpen] = useSidebarState();

  useEffect(() => {
    if (currentEvent) {
      setCurrent(currentEvent.name);
    }
  }, [currentEvent]);

  const ConfigurationMenu = () => (
    <MenuItem component={Link} to="/admins">
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText>Admin Users</ListItemText>
    </MenuItem>
  );

  const CustomUserMenu = () => (
    <UserMenu>
      {permissions?.admins?.view && <ConfigurationMenu />}
      <Logout />
    </UserMenu>
  );

  useEffect(() => {
    setOpen(true);
  }, [current]);

  return (
    <AppBar
      sx={{
        "& .RaAppBar-menuButton": {
          display: currentEventId ? "" : "",
        },
        "& .RaAppBar-menuButton svg": {
          color: (theme) => theme.palette.primary.main,
        },
      }}
      elevation={3}
      open={open}
      {...props}
      userMenu={<CustomUserMenu />}
    >
      <Box
        style={{ margin: "5px 0px", padding: "0 0px 0 12px", borderRight: "1px solid #0A1F33" }}
      >
        <Button variant="text" onClick={goToDashboard} sx={{ p: 0, m: 0 }}>
          <img src={Logo} alt="logo" style={{ width: "40px" }} />
        </Button>
      </Box>
      <Box flex="1" style={{ marginLeft: 15 }}>
        {currentEventId ? (
          <Typography variant="h5" color="primary" noWrap id="react-admin-title">
            <span style={{ marginRight: "5px" }}>{current ?? "Dashboard"} - </span>
          </Typography>
        ) : (
          <Typography variant="h5" color="primary" noWrap>
            <span>{current ?? "Dashboard"}</span>
          </Typography>
        )}
      </Box>

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
              goToDashboard();
              setCurrent("Dashboard");
            }}
          >
            Dashboard
          </MenuItem>
          {activeEvents.map((e) => (
            <MenuItem
              onClick={() => {
                goToEvent(e);
                setCurrent(e.name);
              }}
              key={e.id}
            >
              {e.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </AppBar>
  );
};
