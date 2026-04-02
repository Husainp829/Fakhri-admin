import React from "react";
import { Layout } from "react-admin";
import AppBar from "./appBar";
import Menu from "./menu";

export default (props) => <Layout {...props} menu={Menu} appBar={AppBar} />;
