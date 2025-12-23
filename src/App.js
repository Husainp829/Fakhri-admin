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
import { useBaseRoute, useRouteId } from "./utils/routeUtility";
import { hasPermission } from "./utils/permissionUtils";

import withClearCache from "./ClearCache";

import dataProvider from "./dataprovider";
import authProvider from "./authProvider";
import layout from "./layout";
import admin from "./containers/admin";
import itsdata from "./containers/itsdata";
import whatsappBroadcasts from "./containers/whatsappBroadcasts";
import niyaaz from "./containers/niyaaz";
import MyLoginPage from "./layout/login";
import ForgotPassword from "./layout/forgotPassword";
import receipt from "./containers/receipt";
import SabilReceipt from "./containers/sabil/sabilReceipt/sabilReceiptPrint";
import FmbReceipt from "./containers/fmb/fmbReceipt/fmbReceiptPrint";
import event from "./containers/events/event";
import EventsDashboard from "./containers/events/dashboard";
import ActiveEventDashboard from "./containers/events/eventDashboard";
import Receipt from "./containers/receipt/receiptPrint";
import vendor from "./containers/events/vendor";
import vendorType from "./containers/events/vendorType";
import vendorLedger from "./containers/events/vendorLedger";
import bookingPurpose from "./containers/bookings/bookingPurpose";
import halls from "./containers/bookings/halls";
import hallBookings, { bookings } from "./containers/bookings/hallBookings";
import RentReceiptPrint from "./containers/bookings/rentBookingReceipt/rentReceiptPrint";
import DepositReceiptPrint from "./containers/bookings/rentBookingReceipt/depositReceiptPrint";
import RazaPrint from "./containers/bookings/hallBookings/razaPrint";
import rentBookingReceipt from "./containers/bookings/rentBookingReceipt";
import ConfirmationVoucher from "./containers/bookings/hallBookings/confirmationReceiptPrint";
import DefaultDashboard from "./containers/defaultDashboard";
import staff from "./containers/staff/staff";
import staffAttendance from "./containers/staff/staffAttendance";
import lagatReceipt from "./containers/lagatReceipt";
import LagatReceiptPrint from "./containers/lagatReceipt/lagatReceiptPrint";
import BookingDashboard from "./containers/bookings/dashboard";
import StaffDashboard from "./containers/staff/dashboard";
import SabilDashboard from "./containers/sabil/dashboard";
import sabilData from "./containers/sabil/sabilData";
import sabilTakhmeen from "./containers/sabil/sabilTakhmeen";
import sabilReceipt from "./containers/sabil/sabilReceipt";
import sabilChangeRequests from "./containers/sabil/sabilChangeRequest";
import fmbData from "./containers/fmb/fmbData";
import fmbReceipt from "./containers/fmb/fmbReceipt";
import fmbTakhmeen from "./containers/fmb/fmbTakhmeen";
import FmbDashboard from "./containers/fmb/dashboard";
import blockedHallDates from "./containers/bookings/blockedHallDates";
import miqaatNiyaazReceipts from "./containers/miqaat/miqaatNiyaazReceipts";
import MiqaatNiyaazReceiptPrint from "./containers/miqaat/miqaatNiyaazReceipts/miqaatNiyaazReceiptPrint";
import MiqaatDashboard from "./containers/miqaat/dashboard";

dayjs.extend(utc);

const messages = {
  en: englishMessages,
};

const i18nProvider = polyglotI18nProvider((locale) => messages[locale], "en", {
  allowMissing: true,
});

const MainApp = () => {
  const baseRoute = useBaseRoute();
  const routeId = useRouteId();

  const DashboardAdmin = () => {
    const { permissions } = usePermissions();

    console.log(permissions);

    switch (baseRoute) {
      case "bookings":
        return hasPermission(permissions, "bookings.dashboard") ? (
          <BookingDashboard />
        ) : (
          <Navigate to="/hallBookings" />
        );
      case "events": {
        if (hasPermission(permissions, "event.view")) {
          if (routeId) {
            return <ActiveEventDashboard />;
          }
          return <EventsDashboard />;
        }
        return <DefaultDashboard />;
      }
      case "staff":
        return hasPermission(permissions, "staff.view") ? (
          <StaffDashboard />
        ) : (
          <Navigate to="/employees" />
        );
      case "sabil":
        return hasPermission(permissions, "admins.view") ? (
          <SabilDashboard />
        ) : (
          <Navigate to="/sabilData" />
        );
      case "fmb":
        return hasPermission(permissions, "admins.view") ? (
          <FmbDashboard />
        ) : (
          <Navigate to="/fmbData" />
        );
      case "miqaat":
        return hasPermission(permissions, "receipts.view") ? (
          <MiqaatDashboard />
        ) : (
          <Navigate to="/miqaatNiyaazReceipts" />
        );
      default:
        return <DefaultDashboard />;
    }
  };

  return (
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
              {hasPermission(permissions, "bookings.view") && <Resource {...bookings} />}
              {hasPermission(permissions, "bookings.view") && <Resource {...hallBookings} />}
              {hasPermission(permissions, "bookingReceipts.view") && (
                <Resource {...rentBookingReceipt} />
              )}
              {hasPermission(permissions, "bookingReceipts.view") && <Resource {...lagatReceipt} />}
              {hasPermission(permissions, "halls.view") && <Resource {...bookingPurpose} />}
              {hasPermission(permissions, "halls.view") && <Resource {...halls} />}
              {hasPermission(permissions, "bookings.view") && <Resource {...blockedHallDates} />}

              <CustomRoutes noLayout>
                <Route path="/dep-rcpt/:id" element={<DepositReceiptPrint />} />
              </CustomRoutes>

              <CustomRoutes noLayout>
                <Route path="/raza-print/:id" element={<RazaPrint />} />
              </CustomRoutes>
              <CustomRoutes noLayout>
                <Route path="/confirmation-voucher/:id" element={<ConfirmationVoucher />} />
              </CustomRoutes>
            </>
          )}
          {baseRoute === "events" && (
            <>
              {routeId && (
                <>
                  {hasPermission(permissions, "niyaaz.view") && <Resource {...niyaaz} />}
                  {hasPermission(permissions, "receipts.view") && <Resource {...receipt} />}
                  {hasPermission(permissions, "vendorLedger.edit") && (
                    <Resource {...vendorLedger} />
                  )}
                  <CustomRoutes noLayout>
                    <Route path="/niyaaz-receipt" element={<Receipt />} />
                  </CustomRoutes>
                </>
              )}
              {hasPermission(permissions, "vendors.edit") && <Resource {...vendor} />}
              {hasPermission(permissions, "vendorTypes.edit") && <Resource {...vendorType} />}
              <Resource {...event} />
            </>
          )}
          {baseRoute === "staff" && (
            <>
              {hasPermission(permissions, "employees.view") && <Resource {...staff} />}
              {hasPermission(permissions, "employees.view") && <Resource {...staffAttendance} />}
            </>
          )}
          {baseRoute === "sabil" && (
            <>
              {hasPermission(permissions, "admins.view") && <Resource {...sabilData} />}
              {hasPermission(permissions, "admins.view") && <Resource {...sabilReceipt} />}
              {hasPermission(permissions, "admins.view") && <Resource {...sabilTakhmeen} />}
              {hasPermission(permissions, "admins.view") && <Resource {...sabilChangeRequests} />}
            </>
          )}
          {baseRoute === "fmb" && (
            <>
              {hasPermission(permissions, "admins.view") && <Resource {...fmbData} />}
              {hasPermission(permissions, "admins.view") && <Resource {...fmbReceipt} />}
              {hasPermission(permissions, "admins.view") && <Resource {...fmbTakhmeen} />}
            </>
          )}
          {baseRoute === "miqaat" && (
            <>
              {hasPermission(permissions, "receipts.view") && (
                <Resource {...miqaatNiyaazReceipts} />
              )}
            </>
          )}
          {hasPermission(permissions, "admins.view") && <Resource {...admin} />}
          {hasPermission(permissions, "show.its") && <Resource {...itsdata} />}
          {hasPermission(permissions, "admins.view") && <Resource {...whatsappBroadcasts} />}
          {/* auth-less routes */}
          <CustomRoutes noLayout>
            <Route path="/cont-rcpt/:id" element={<RentReceiptPrint />} />
          </CustomRoutes>
          <CustomRoutes noLayout>
            <Route path="/lagat-rcpt/:id" element={<LagatReceiptPrint />} />
          </CustomRoutes>
          <CustomRoutes noLayout>
            <Route path="/mqt-rcpt/:id" element={<MiqaatNiyaazReceiptPrint />} />
          </CustomRoutes>
          <CustomRoutes noLayout>
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </CustomRoutes>
        </>
      )}

      <CustomRoutes noLayout>
        <Route path="/sabil-receipt" element={<SabilReceipt />} />
      </CustomRoutes>
      <CustomRoutes noLayout>
        <Route path="/fmb-receipt" element={<FmbReceipt />} />
      </CustomRoutes>
    </Admin>
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
