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
import fmbContributions from "../containers/fmb/fmbContributions";
import fmbDeliveryScheduleProfile from "../containers/fmb/fmbDeliveryScheduleProfile";
import fmbThaliSettings from "../containers/fmb/fmbThaliSettings";
import fmbHoliday from "../containers/fmb/fmbHoliday";
import fmbThaliSuspension from "../containers/fmb/fmbThaliSuspension";
import fmbThaliType from "../containers/fmb/fmbThaliType";

import miqaatNiyaazReceipts from "../containers/miqaat/miqaatNiyaazReceipts";

import ohbatMajlis from "../containers/ohbat/ohbatMajlis";
import ohbatMajlisUpcoming from "../containers/ohbat/ohbatMajlisUpcoming";
import ohbatMajlisAttendance from "../containers/ohbat/ohbatMajlisAttendance";
import sadarats from "../containers/ohbat/sadarats";
import makhsoosItsData from "../containers/ohbat/makhsoosItsData";

/**
 * @typedef {Object} ResourceConfig
 * @property {string|null} permission - Permission to view resource; null = always show (unless permissionsAny is set)
 * @property {string[]} [permissionsAny] - User needs at least one of these permissions (OR)
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
      { permission: "fmbData.view", resource: fmbData, createPermission: "fmbData.create" },
      {
        permission: "fmbReceipt.view",
        resource: fmbReceipt,
        createPermission: "fmbReceipt.create",
      },
      { permission: "fmbData.view", resource: fmbContributions, createPermission: "fmbData.edit" },
      { permission: "fmbData.view", resource: fmbTakhmeen, createPermission: "fmbData.edit" },
      {
        permission: "fmbThaliSuspension.view",
        resource: fmbThaliSuspension,
        createPermission: "fmbThaliSuspension.create",
      },
      {
        permission: "fmbDeliveryScheduleProfile.view",
        resource: fmbDeliveryScheduleProfile,
        createPermission: "fmbDeliveryScheduleProfile.create",
      },
      {
        permission: "fmbHoliday.view",
        resource: fmbHoliday,
        createPermission: "fmbHoliday.create",
      },
      {
        permission: "fmbThaliType.view",
        resource: fmbThaliType,
        createPermission: "fmbThaliType.create",
      },
      { permission: "fmbThaliSettings.view", resource: fmbThaliSettings },
    ],
  },
  miqaat: {
    resources: [{ permission: "miqaatNiyaazReceipts.view", resource: miqaatNiyaazReceipts }],
  },
  ohbat: {
    resources: [
      { permission: "ohbatMajalis.view", resource: ohbatMajlis, createPermission: "ohbatMajalis.create" },
      {
        permissionsAny: ["ohbatMajalis.view", "ohbatMajlisAttendance.view"],
        resource: ohbatMajlisUpcoming,
      },
      {
        permission: "ohbatMajlisAttendance.view",
        resource: ohbatMajlisAttendance,
        createPermission: "ohbatMajlisAttendance.create",
      },
      { permission: "sadarats.view", resource: sadarats, createPermission: "sadarats.create" },
      {
        permission: "makhsoosItsData.view",
        resource: makhsoosItsData,
        createPermission: "makhsoosItsData.create",
      },
    ],
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
