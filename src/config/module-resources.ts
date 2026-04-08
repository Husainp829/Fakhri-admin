/**
 * Resource configuration per module.
 * Used by App.tsx to render Resources based on baseRoute.
 */
import hallBookings, { bookings } from "@/containers/bookings/hall-bookings";
import bookingPurpose from "@/containers/bookings/booking-purpose";
import halls from "@/containers/bookings/halls";
import blockedHallDates from "@/containers/bookings/blocked-hall-dates";
import rentBookingReceipt from "@/containers/bookings/rent-booking-receipt";
import lagatReceipt from "@/containers/lagat-receipt";
import DepositReceiptPrint from "@/containers/bookings/rent-booking-receipt/DepositReceiptPrint";
import RazaPrint from "@/containers/bookings/hall-bookings/HallBookingsRazaPrint";
import ConfirmationVoucher from "@/containers/bookings/hall-bookings/HallBookingsConfirmationVoucher";

import niyaaz from "@/containers/events/niyaaz";
import niyaazBookedSlots from "@/containers/events/niyaaz-booked-slots";
import receipt from "@/containers/events/receipt";
import vendorLedger from "@/containers/events/vendor-ledger";
import vendor from "@/containers/events/vendor";
import vendorType from "@/containers/events/vendor-type";
import event from "@/containers/events/event";

import staff from "@/containers/staff/staff";
import staffAttendance from "@/containers/staff/staff-attendance";

import sabilData from "@/containers/sabil/sabil-data";
import sabilReceipt from "@/containers/sabil/sabil-receipt";
import sabilTakhmeen from "@/containers/sabil/sabil-takhmeen";
import sabilChangeRequests from "@/containers/sabil/sabil-change-request";
import sabilLedger from "@/containers/sabil/sabil-ledger";

import fmbData from "@/containers/fmb/fmb-data";
import fmbReceipt from "@/containers/fmb/fmb-receipt";
import fmbTakhmeen from "@/containers/fmb/fmb-takhmeen";
import fmbContributions from "@/containers/fmb/fmb-contributions";
import fmbDeliveryScheduleProfile from "@/containers/fmb/fmb-delivery-schedule-profile";
import fmbThaliSettings from "@/containers/fmb/fmb-thali-settings";
import fmbHoliday from "@/containers/fmb/fmb-holiday";
import fmbThaliSuspension from "@/containers/fmb/fmb-thali-suspension";
import fmbThaliType from "@/containers/fmb/fmb-thali-type";

import miqaatNiyaazReceipts from "@/containers/miqaat/miqaat-niyaaz-receipts";

import ohbatMajlis from "@/containers/ohbat/ohbat-majlis";
import ohbatMajlisUpcoming from "@/containers/ohbat/ohbat-majlis-upcoming";
import ohbatMajlisAttendance from "@/containers/ohbat/ohbat-majlis-attendance";
import sadarats from "@/containers/ohbat/sadarats";
import makhsoosItsData from "@/containers/ohbat/makhsoos-its-data";

import type { ModuleResourcesValue } from "@/types/react-admin-config";

/**
 * Module resources keyed by baseRoute path.
 * Each entry: { resources: ResourceConfig[], customRoutes?: CustomRouteConfig[] }
 */
export const MODULE_RESOURCES: Record<string, ModuleResourcesValue> = {
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
      { permission: "halls.view", resource: halls, createPermission: "halls.create" },
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
      {
        permission: "ohbatMajalis.view",
        resource: ohbatMajlis,
        createPermission: "ohbatMajalis.create",
      },
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
