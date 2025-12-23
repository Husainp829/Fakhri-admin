/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React, { createElement, useState } from "react";

import {
  Menu,
  MenuItemLink,
  usePermissions,
  useResourceDefinitions,
  useSidebarState,
} from "react-admin";
import DashboardIcon from "@mui/icons-material/Dashboard";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SubMenu from "./subMenu";
import { hasPermission } from "../utils/permissionUtils";

const MENU_TYPES = {
  SABIL: "SABIL",
  FMB: "FMB",
  NIYAAZ: "NIYAAZ",
  VENDOR: "VENDOR",
  VENDOR_MASTER: "VENDOR_MASTER",
};

const LayoutMenu = () => {
  const resources = useResourceDefinitions();
  const { permissions } = usePermissions();
  const [isOpen, setIsOpen] = useState({
    [MENU_TYPES.NIYAAZ]: true,
  });
  const [open] = useSidebarState();
  const handleToggle = (type) => {
    setIsOpen({ ...isOpen, [type]: !isOpen[type] });
  };

  const MENUS = [];

  MENUS.push(
    ...(hasPermission(permissions, "vendors.edit") &&
    resources.vendors &&
    resources.vendorTypes
      ? [
          {
            id: MENU_TYPES.VENDOR_MASTER,
            name: "Vendor Master",
            icon: <StorefrontIcon />,
            items: [resources.vendors, resources.vendorTypes],
          },
        ]
      : [])
  );

  return (
    <Menu
      sx={{
        marginTop: 1,
        borderRight: "1px solid rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <MenuItemLink
        to="/"
        primaryText="Dashboard"
        leftIcon={<DashboardIcon />}
      />
      <Menu.ResourceItem name="niyaaz" />
      <Menu.ResourceItem name="receipts" />
      <Menu.ResourceItem name="vendorLedger" />
      {MENUS.map((menu) => (
        <SubMenu
          key={menu.item}
          icon={menu.icon}
          sidebarIsOpen={open}
          isOpen={isOpen[menu.id]}
          handleToggle={() => handleToggle(menu.id)}
          name={menu.name}
          dense={false}
        >
          {menu.items.map((item) =>
            item ? (
              <MenuItemLink
                key={item.name}
                to={`/${item.name}`}
                primaryText={item.options?.label}
                leftIcon={createElement(item.icon)}
              />
            ) : null
          )}
        </SubMenu>
      ))}
      {/* <Menu.ResourceItem name="mohallas" />
      <Menu.ResourceItem name="lagatTypes" /> */}

      <Menu.ResourceItem name="hallBookings" />
      <Menu.ResourceItem name="contRcpt" />
      <Menu.ResourceItem name="lagatReceipts" />
      <Menu.ResourceItem name="halls" />
      <Menu.ResourceItem name="blockedHallDates" />
      <Menu.ResourceItem name="bookingPurpose" />
      <Menu.ResourceItem name="employees" />
      <Menu.ResourceItem name="employeesAttendance" />
      <Menu.ResourceItem name="sabilData" />
      <Menu.ResourceItem name="sabilReceipt" />
      <Menu.ResourceItem name="sabilChangeRequests" />
      <Menu.ResourceItem name="fmbData" />
      <Menu.ResourceItem name="fmbReceipt" />
      <Menu.ResourceItem name="itsdata" />
      <Menu.ResourceItem name="admins" />
    </Menu>
  );
};

export default LayoutMenu;
