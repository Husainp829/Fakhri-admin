import React from "react";
import ExpandMore from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Tooltip from "@mui/material/Tooltip";

const SubMenu = ({ handleToggle, sidebarIsOpen, isOpen, name, icon, children, dense }) => {
  const header = (
    <MenuItem dense={dense} button onClick={handleToggle}>
      <ListItemIcon sx={{ minWidth: (theme) => theme.spacing(4) }}>
        {isOpen ? <ExpandMore /> : icon}
      </ListItemIcon>
      <Typography variant="inherit" color="textSecondary">
        {name}
      </Typography>
    </MenuItem>
  );

  return (
    <>
      {sidebarIsOpen || isOpen ? (
        header
      ) : (
        <Tooltip title={name} placement="right">
          {header}
        </Tooltip>
      )}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List
          dense={dense}
          component="div"
          disablePadding
          sx={{
            "& a": {
              paddingLeft: (theme) => theme.spacing(sidebarIsOpen ? 4 : 2),
              transition: (theme) =>
                `padding-left ${theme.transitions.duration.shortest}ms ${theme.transitions.easing.easeInOut}`,
            },
          }}
        >
          {children}
        </List>
      </Collapse>
    </>
  );
};

export default SubMenu;
