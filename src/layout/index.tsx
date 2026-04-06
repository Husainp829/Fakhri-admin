import type { ReactElement } from "react";
import { Layout } from "react-admin";
import type { LayoutProps } from "react-admin";
import LayoutAppBar from "./LayoutAppBar";
import LayoutMenu from "./LayoutMenu";

const AdminLayout = (props: LayoutProps): ReactElement => (
  <Layout {...props} menu={LayoutMenu} appBar={LayoutAppBar} />
);

export default AdminLayout;
