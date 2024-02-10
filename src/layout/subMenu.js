import React from "react";
import ExpandMore from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Tooltip from "@mui/material/Tooltip";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  icon: { minWidth: theme.spacing(4) },
  sidebarIsOpen: {
    "& a": {
      paddingLeft: theme.spacing(4),
      transition: "padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
    },
  },
  sidebarIsClosed: {
    "& a": {
      paddingLeft: theme.spacing(2),
      transition: "padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
    },
  },
}));

const SubMenu = ({
  handleToggle,
  sidebarIsOpen,
  isOpen,
  name,
  icon,
  children,
  dense,
}) => {
  const classes = useStyles();

  const header = (
    <MenuItem dense={dense} button onClick={handleToggle}>
      <ListItemIcon className={classes.icon}>
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
          className={
            sidebarIsOpen ? classes.sidebarIsOpen : classes.sidebarIsClosed
          }
        >
          {children}
        </List>
      </Collapse>
    </>
  );
};

export default SubMenu;
