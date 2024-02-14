/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
import React from "react";
import { Admin, Resource, defaultTheme, CustomRoutes } from "react-admin";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { red } from "@mui/material/colors";
import { Route } from "react-router-dom";

import withClearCache from "./ClearCache";

import dataProvider from "./dataprovider";
import authProvider from "./authProvider";
import layout from "./layout";
import admin from "./containers/admin";
import itsdata from "./containers/itsdata";
import niyaaz from "./containers/niyaaz";
import LabelPrint from "./containers/labelPrint";
import MyLoginPage from "./layout/login";
import ForgotPassword from "./layout/forgotPassword";
import receipt from "./containers/receipt";
import sabilData from "./containers/sabilData";
import sabilReceipt from "./containers/sabilReceipt";
import sabilTakhmeen from "./containers/sabilTakhmeen";
import SabilReceipt from "./containers/sabilReceipt/sabilReceiptPrint";
import fmbData from "./containers/fmbData";
import fmbTakhmeen from "./containers/fmbTakhmeen";
import fmbReceipt from "./containers/fmbReceipt";
import FmbReceipt from "./containers/fmbReceipt/fmbReceiptPrint";
import mohallas from "./containers/mohallas";
import sabilChangeRequest from "./containers/sabilChangeRequest";
import event from "./containers/event";
import dashboard from "./containers/dashboard";
import eventDashboard from "./containers/eventDashboard";
import lagatTypes from "./containers/lagatTypes";
import { getEventId } from "./utils";
import EventProvider from "./dataprovider/eventProvider";
import Receipt from "./containers/receipt/receiptPrint";

const messages = {
  en: englishMessages,
};

const i18nProvider = polyglotI18nProvider((locale) => messages[locale], "en", {
  allowMissing: true,
});

const MainApp = () => {
  const eventId = getEventId();
  return (
    <EventProvider>
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        layout={layout}
        dashboard={eventId ? eventDashboard : dashboard}
        theme={appTheme}
        loginPage={MyLoginPage}
      >
        {/* {(permissions) => <>{permissions?.admins?.view && <Resource {...admin} />}</>} */}
        <Resource {...event} />
        {eventId && [<Resource {...niyaaz} />, <Resource {...receipt} />]}
        <Resource {...itsdata} />
        <Resource {...sabilData} />
        <Resource {...sabilTakhmeen} />
        <Resource {...sabilReceipt} />
        <Resource {...sabilChangeRequest} />
        <Resource {...fmbData} />
        <Resource {...fmbTakhmeen} />
        <Resource {...fmbReceipt} />
        <Resource {...mohallas} />
        <Resource {...lagatTypes} />
        <Resource {...admin} />

        <CustomRoutes noLayout>
          <Route path="/sabil-receipt" element={<SabilReceipt />} />
        </CustomRoutes>
        <CustomRoutes noLayout>
          <Route path="/niyaaz-receipt" element={<Receipt />} />
        </CustomRoutes>
        <CustomRoutes noLayout>
          <Route path="/fmb-receipt" element={<FmbReceipt />} />
        </CustomRoutes>
        <CustomRoutes noLayout>
          <Route path="/labelprint" element={<LabelPrint />} />
        </CustomRoutes>
        <CustomRoutes noLayout>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </CustomRoutes>
      </Admin>
    </EventProvider>
  );
};

const ClearCacheComponent = withClearCache(MainApp);

function App() {
  return <ClearCacheComponent />;
}
const appTheme = {
  ...defaultTheme,
  palette: {
    mode: "light",
    primary: {
      main: "#0A1F32",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffffff",
      contrastText: "#0A1F32",
    },
    error: red,
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
  typography: {
    fontFamily: ["Quantico", "sans-serif"].join(","),
  },
  sidebar: {
    borderRight: "1px solid #000",
  },
  components: {
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          // paddingLeft: "12px",
          "&.RaMenuItemLink-active": {
            background: "#6bd0dc",
            color: "#ffffff",
            "& .RaMenuItemLink-icon": {
              color: "#ffffff",
            },
          },
          "& .RaMenuItemLink-icon": {
            color: "#0A1F32",
          },
        },
      },
    },
  },
  overrides: {
    MuiButton: {
      root: {
        color: "light", // Some CSS
      },
    },
    "& .RaSidebar-drawerPaper": {
      backgroundColor: "red",
    },
  },
};

export default App;
