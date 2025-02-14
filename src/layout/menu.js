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
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SubMenu from "./subMenu";
import { getEventId } from "../utils";

const MENU_TYPES = {
  SABIL: "SABIL",
  FMB: "FMB",
  NIYAAZ: "NIYAAZ",
  VENDOR: "VENDOR",
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
  const eventId = getEventId();
  const MENUS = eventId
    ? [
        {
          id: MENU_TYPES.NIYAAZ,
          name: "Niyaaz",
          icon: <AccountBoxIcon />,
          items: [resources.niyaaz, resources.receipts],
        },
        ...(permissions?.vendorLedger?.edit
          ? [
              {
                id: MENU_TYPES.VENDOR,
                name: "Vendor Ledger",
                icon: <AccountBoxIcon />,
                items: [resources.vendorLedger],
              },
            ]
          : []),
        // {
        //   id: MENU_TYPES.SABIL,
        //   name: "Sabil",
        //   icon: <AccountBoxIcon />,
        //   items: [resources.sabilData, resources.sabilReceipt, resources.sabilChangeRequests],
        // },
        // {
        //   id: MENU_TYPES.FMB,
        //   name: "FMB",
        //   icon: <AccountBoxIcon />,
        //   items: [resources.fmbData, resources.fmbReceipt],
        // },
      ]
    : [];

  return (
    <Menu
      sx={{
        marginTop: 1,
        borderRight: "1px solid rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <MenuItemLink to="/" primaryText="Dashboard" leftIcon={<DashboardIcon />} />
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
      <Menu.ResourceItem name="vendors" />
      <Menu.ResourceItem name="vendorTypes" />
      <Menu.ResourceItem name="itsdata" />
      <Menu.ResourceItem name="admins" />
    </Menu>
  );
};

export default LayoutMenu;
