/**
 * Resource configuration per module.
 * Used by App.js to render Resources based on baseRoute.
 */
import hallBookings, { bookings } from "../containers/bookings/hallBookings";
import bookingPurpose from "../containers/bookings/bookingPurpose";
import halls from "../containers/bookings/halls";
import blockedHallDates from "../containers/bookings/blockedHallDates";
import rentBookingReceipt from "../containers/bookings/rentBookingReceipt";
import lagatReceipt from "../containers/lagatReceipt";
import DepositReceiptPrint from "../containers/bookings/rentBookingReceipt/depositReceiptPrint";
import RazaPrint from "../containers/bookings/hallBookings/razaPrint";
import ConfirmationVoucher from "../containers/bookings/hallBookings/confirmationReceiptPrint";

import niyaaz from "../containers/events/niyaaz";
import niyaazBookedSlots from "../containers/events/niyaazBookedSlots";
import receipt from "../containers/events/receipt";
import vendorLedger from "../containers/events/vendorLedger";
import vendor from "../containers/events/vendor";
import vendorType from "../containers/events/vendorType";
import event from "../containers/events/event";

import staff from "../containers/staff/staff";
import staffAttendance from "../containers/staff/staffAttendance";

import sabilData from "../containers/sabil/sabilData";
import sabilReceipt from "../containers/sabil/sabilReceipt";
import sabilTakhmeen from "../containers/sabil/sabilTakhmeen";
import sabilChangeRequests from "../containers/sabil/sabilChangeRequest";
import sabilLedger from "../containers/sabil/sabilLedger";

import fmbData from "../containers/fmb/fmbData";
import fmbReceipt from "../containers/fmb/fmbReceipt";
import fmbTakhmeen from "../containers/fmb/fmbTakhmeen";

import miqaatNiyaazReceipts from "../containers/miqaat/miqaatNiyaazReceipts";

/**
 * @typedef {Object} ResourceConfig
 * @property {string|null} permission - Permission to view resource; null = always show
 * @property {Object} resource - React-admin resource definition
 * @property {string} [createPermission] - Permission to show create button; if absent, use resource.create as-is
 * @property {boolean} [requireRouteId] - Only show when routeId exists (events module)
 */

/**
 * @typedef {Object} CustomRouteConfig
 * @property {string} path - Route path (e.g. "/dep-rcpt/:id")
 * @property {React.Component} element - Route element component
 */

/**
 * Module resources keyed by baseRoute path.
 * Each entry: { resources: ResourceConfig[], customRoutes?: CustomRouteConfig[] }
 */
export const MODULE_RESOURCES = {
  bookings: {
    resources: [
      { permission: "bookings.view", resource: bookings },
      { permission: "bookings.view", resource: hallBookings },
      {
        permission: "bookingReceipts.view",
        resource: rentBookingReceipt,
        createPermission: "bookingReceipts.create",
      },
      {
        permission: "lagatReceipts.view",
        resource: lagatReceipt,
        createPermission: "bookingReceipts.create",
      },
      { permission: "halls.view", resource: bookingPurpose },
      { permission: "halls.view", resource: halls },
      { permission: "bookings.view", resource: blockedHallDates },
    ],
    customRoutes: [
      { path: "/dep-rcpt/:id", element: DepositReceiptPrint },
      { path: "/raza-print/:id", element: RazaPrint },
      { path: "/confirmation-voucher/:id", element: ConfirmationVoucher },
    ],
  },
  events: {
    resources: [
      {
        permission: "niyaaz.view",
        resource: niyaaz,
        requireRouteId: true,
      },
      {
        permission: "niyaaz.view",
        resource: niyaazBookedSlots,
        requireRouteId: true,
      },
      {
        permission: "receipts.view",
        resource: receipt,
        requireRouteId: true,
      },
      {
        permission: "vendorLedger.edit",
        resource: vendorLedger,
        requireRouteId: true,
      },
      { permission: "vendors.edit", resource: vendor },
      { permission: "vendorTypes.edit", resource: vendorType },
      { permission: null, resource: event },
    ],
  },
  staff: {
    resources: [
      { permission: "employees.view", resource: staff },
      { permission: "employees.view", resource: staffAttendance },
    ],
  },
  sabil: {
    resources: [
      { permission: "sabil.view", resource: sabilData },
      {
        permission: "sabilReceipts.view",
        resource: sabilReceipt,
        createPermission: "sabilReceipts.create",
      },
      { permission: "sabil.view", resource: sabilTakhmeen },
      { permission: "sabil.view", resource: sabilChangeRequests },
      { permission: "sabil.view", resource: sabilLedger },
    ],
  },
  fmb: {
    resources: [
      { permission: "admins.view", resource: fmbData },
      { permission: "admins.view", resource: fmbReceipt },
      { permission: "admins.view", resource: fmbTakhmeen },
    ],
  },
  miqaat: {
    resources: [{ permission: "miqaatNiyaazReceipts.view", resource: miqaatNiyaazReceipts }],
  },
  accounts: {
    resources: [
      {
        permission: "sabilReceipts.view",
        resource: sabilReceipt,
        createPermission: "sabilReceipts.create",
      },
      {
        permission: "lagatReceipts.view",
        resource: lagatReceipt,
        createPermission: "lagatReceipts.create",
      },
      {
        permission: "bookingReceipts.view",
        resource: rentBookingReceipt,
        createPermission: "bookingReceipts.create",
      },
    ],
  },
};
