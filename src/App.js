/* eslint-disable no-console */
import React from "react";
import { Admin, Resource, defaultTheme, CustomRoutes, usePermissions } from "react-admin";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { deepmerge } from "@mui/utils";
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
import SabilReceipt from "./containers/sabilReceipt/sabilReceiptPrint";
import FmbReceipt from "./containers/fmbReceipt/fmbReceiptPrint";
import event from "./containers/event";
import Dashboard from "./containers/dashboard";
import EventDashboard from "./containers/eventDashboard";
import { getEventId } from "./utils";
import EventProvider from "./dataprovider/eventProvider";
import Receipt from "./containers/receipt/receiptPrint";
import vendor from "./containers/vendor";
import vendorType from "./containers/vendorType";
import vendorLedger from "./containers/vendorLedger";
import bookingPurpose from "./containers/bookingPurpose";
import halls from "./containers/halls";
import bookings from "./containers/bookings";
import RentReceiptPrint from "./containers/rentBookingReceipt/rentReceiptPrint";
import DepositReceiptPrint from "./containers/rentBookingReceipt/depositReceiptPrint";
import RazaPrint from "./containers/bookings/razaPrint";
import rentBookingReceipt from "./containers/rentBookingReceipt";
import ConfirmationVoucher from "./containers/bookings/confirmationReceiptPrint";
import DefaultDashboard from "./containers/defaultDashboard";
import employees from "./containers/employees";
import employeesAttendance from "./containers/employeesAttendance";

const messages = {
  en: englishMessages,
};

const i18nProvider = polyglotI18nProvider((locale) => messages[locale], "en", {
  allowMissing: true,
});

const MainApp = () => {
  const eventId = getEventId();

  const DashboardAdmin = () => {
    const { permissions } = usePermissions();
    if (!permissions?.event?.view) return <DefaultDashboard />;
    return eventId ? <EventDashboard /> : <Dashboard />;
  };

  return (
    <EventProvider>
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        layout={layout}
        dashboard={DashboardAdmin}
        theme={appTheme}
        loginPage={MyLoginPage}
      >
        {(permissions) => (
          <>
            {permissions?.admins?.view && <Resource {...admin} />}
            {permissions?.show?.its && <Resource {...itsdata} />}
            {permissions?.vendors?.edit && <Resource {...vendor} />}
            {permissions?.vendorTypes?.edit && <Resource {...vendorType} />}
            {permissions?.halls?.view && <Resource {...bookingPurpose} />}
            {permissions?.halls?.view && <Resource {...halls} />}
            {permissions?.bookings?.view && <Resource {...bookings} />}
            {permissions?.bookings?.view && <Resource {...rentBookingReceipt} />}
            {permissions?.bookings?.view && <Resource name="hallBookings" />}
            {permissions?.employees?.view && <Resource {...employees} />}
            {permissions?.employees?.view && <Resource {...employeesAttendance} />}

            {eventId && (
              <>
                {permissions?.niyaaz?.view && <Resource {...niyaaz} />}
                {permissions?.receipt?.view && <Resource {...receipt} />}
                {permissions?.vendorLedger?.edit && <Resource {...vendorLedger} />}
              </>
            )}
          </>
        )}

        <Resource {...event} />

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
          <Route path="/cont-rcpt/:id" element={<RentReceiptPrint />} />
        </CustomRoutes>
        <CustomRoutes noLayout>
          <Route path="/dep-rcpt/:id" element={<DepositReceiptPrint />} />
        </CustomRoutes>
        <CustomRoutes noLayout>
          <Route path="/raza-print/:id" element={<RazaPrint />} />
        </CustomRoutes>
        <CustomRoutes noLayout>
          <Route path="/confirmation-voucher/:id" element={<ConfirmationVoucher />} />
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
const appTheme = deepmerge(defaultTheme, {
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
    error: { main: "#f44336" },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
  typography: {
    fontFamily: ["Quantico", "Roboto", "sans-serif"].join(","),
  },
  sidebar: {
    borderRight: "1px solid #000",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ".RaLayout-content": {
          marginTop: "1rem",
        },
      },
    },

    RaMenuItemLink: {
      styleOverrides: {
        root: {
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
});

export default App;
