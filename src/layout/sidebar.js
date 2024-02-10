// CustomSidebar.js

import React from "react";
import { Drawer, List, ListItem, ListItemText, Collapse } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link, SidebarClasses, useSidebarState } from "react-admin";

const menuItems = [
  { name: "Dashboard", path: "/" },
  {
    name: "Products",
    children: [
      { name: "Product List", path: "/products" },
      { name: "Add Product", path: "/products/add" },
    ],
  },
  // Add more menu items as needed
];
const CustomSidebar = () => {
  const [openDrawer, setOpenDrawer] = useSidebarState();
  const [open, setOpen] = React.useState([]);

  const handleClick = (index) => {
    const newOpenState = [...open];
    newOpenState[index] = !newOpenState[index];
    setOpen(newOpenState);
  };

  const renderMenuItem = (item, index) => (
    <div key={index}>
      {item.children ? (
        <>
          <ListItem button onClick={() => handleClick(index)}>
            <ListItemText primary={item.name} />
            {open[index] ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open[index]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child, idx) => (
                <ListItem
                  button
                  key={idx}
                  component={Link}
                  to={child.path}
                  style={{ paddingLeft: 20 }}
                >
                  <ListItemText primary={child.name} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </>
      ) : (
        <ListItem button component={Link} to={item.path}>
          <ListItemText primary={item.name} />
        </ListItem>
      )}
    </div>
  );

  return (
    <Drawer
      variant="temporary"
      open={openDrawer}
      onClose={() => setOpenDrawer(!openDrawer)}
      classes={SidebarClasses}
    >
      <List>{menuItems.map((item, index) => renderMenuItem(item, index))}</List>
    </Drawer>
  );
};

export default CustomSidebar;
