import type { ReactElement } from "react";
import { Menu } from "react-admin";
import type { MenuProps } from "react-admin";

const LayoutMenu = (props: MenuProps): ReactElement => (
  <Menu
    sx={{
      borderRight: 1,
      borderColor: "divider",
      height: "100%",
    }}
    {...props}
  />
);

export default LayoutMenu;
