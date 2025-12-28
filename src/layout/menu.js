import React from "react";

import { Menu } from "react-admin";

const LayoutMenu = (props) => (
    <Menu
      sx={{
        mt: 1,
        borderRight: 1,
        borderColor: "divider",
        height: "100%",
      }}
      {...props}
    />
  );

export default LayoutMenu;
