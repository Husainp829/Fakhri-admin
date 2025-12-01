/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from "react";
import { Admin, Resource, defaultTheme, CustomRoutes, usePermissions } from "react-admin";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { deepmerge } from "@mui/utils";
import { Navigate, Route } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useBaseRoute } from "./routeUtility";

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
import bookingPurpose from "./containers/booking/bookingPurpose";
import halls from "./containers/booking/halls";
import hallBookings, { bookings } from "./containers/booking/hallBookings";
import RentReceiptPrint from "./containers/booking/rentBookingReceipt/rentReceiptPrint";
import DepositReceiptPrint from "./containers/booking/rentBookingReceipt/depositReceiptPrint";
import RazaPrint from "./containers/booking/hallBookings/razaPrint";
import rentBookingReceipt from "./containers/booking/rentBookingReceipt";
import ConfirmationVoucher from "./containers/booking/hallBookings/confirmationReceiptPrint";
import DefaultDashboard from "./containers/defaultDashboard";
import staff from "./containers/staff/staff";
import staffAttendance from "./containers/staff/staffAttendance";
import lagatReceipt from "./containers/lagatReceipt";
import LagatReceipt from "./containers/lagatReceipt/lagatReceiptPrint";
import BookingDashboard from "./containers/booking/bookingDashboard";

dayjs.extend(utc);

const messages = {
  en: englishMessages,
};

const i18nProvider = polyglotI18nProvider((locale) => messages[locale], "en", {
  allowMissing: true,
});

const MainApp = () => {
  const eventId = getEventId();

  const baseRoute = useBaseRoute();

  const DashboardAdmin = () => {
    const { permissions } = usePermissions();

    switch (baseRoute) {
      case "bookings":
        return permissions?.bookings?.dashboard ? (
          <BookingDashboard />
        ) : (
          <Navigate to="/" replace />
        );
      case "events":
        return permissions?.event?.view ? <EventDashboard /> : <DefaultDashboard />;
      default:
        return <DefaultDashboard />;
    }
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
            {baseRoute === "bookings" && (
              <>
                {permissions?.bookings?.view && <Resource {...bookings} />}
                {permissions?.bookings?.view && <Resource {...hallBookings} />}
                {permissions?.bookingReceipts?.view && <Resource {...rentBookingReceipt} />}
                {permissions?.bookingReceipts?.view && <Resource {...lagatReceipt} />}
                {permissions?.halls?.view && <Resource {...bookingPurpose} />}
                {permissions?.halls?.view && <Resource {...halls} />}
                <CustomRoutes noLayout>
                  <Route path="/cont-rcpt/:id" element={<RentReceiptPrint />} />
                </CustomRoutes>
                <CustomRoutes noLayout>
                  <Route path="/dep-rcpt/:id" element={<DepositReceiptPrint />} />
                </CustomRoutes>
                <CustomRoutes noLayout>
                  <Route path="/lagat-rcpt/:id" element={<LagatReceipt />} />
                </CustomRoutes>
                <CustomRoutes noLayout>
                  <Route path="/raza-print/:id" element={<RazaPrint />} />
                </CustomRoutes>
                <CustomRoutes noLayout>
                  <Route path="/confirmation-voucher/:id" element={<ConfirmationVoucher />} />
                </CustomRoutes>
              </>
            )}
            {permissions?.admins?.view && <Resource {...admin} />}
            {permissions?.show?.its && <Resource {...itsdata} />}
            <CustomRoutes noLayout>
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </CustomRoutes>
          </>
        )}
        {/* {(permissions) => (
          <>
            {permissions?.vendors?.edit && <Resource {...vendor} />}
            {permissions?.vendorTypes?.edit && <Resource {...vendorType} />}
            {permissions?.employees?.view && <Resource {...staff} />}
            {permissions?.employees?.view && <Resource {...staffAttendance} />}

            {eventId && (
              <>
                {permissions?.niyaaz?.view && <Resource {...niyaaz} />}
                {permissions?.receipt?.view && <Resource {...receipt} />}
                {permissions?.vendorLedger?.edit && <Resource {...vendorLedger} />}
              </>
            )}
          </>
        )} */}

        {/* <Resource {...event} />

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
         */}
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
