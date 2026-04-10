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
import fmbDish from "@/containers/fmb/fmb-dish";
import fmbDailyMenu from "@/containers/fmb/fmb-daily-menu";
import fmbThaliDistributor from "@/containers/fmb/fmbThaliDistributor";
import fmbThaliDistributionDailyRun from "@/containers/fmb/fmbThaliDistributionDailyRun";
import fmbVendor from "@/containers/fmb/fmb-vendor";
import fmbVendorPaymentVoucher from "@/containers/fmb/fmb-vendor-payment-voucher";

import miqaatNiyaazReceipts from "@/containers/miqaat/miqaat-niyaaz-receipts";

import yearlyNiyaaz from "@/containers/yearly-niyaaz/yearly-niyaaz";
import yearlyNiyaazReceipts from "@/containers/yearly-niyaaz/yearly-niyaaz-receipts";
import yearlyNiyaazSettings from "@/containers/yearly-niyaaz/yearly-niyaaz-settings";
import YearlyNiyaazReceiptPrint from "@/containers/yearly-niyaaz/yearly-niyaaz-receipts/YearlyNiyaazReceiptPrint";

import ohbatMajlis from "@/containers/ohbat/ohbat-majlis";
import ohbatMajlisUpcoming from "@/containers/ohbat/ohbat-majlis-upcoming";
import ohbatMajlisAttendance from "@/containers/ohbat/ohbat-majlis-attendance";
import sadarats from "@/containers/ohbat/sadarats";
import makhsoosItsData from "@/containers/ohbat/makhsoos-its-data";

import {
  moduleWithSections,
  type ModuleResourcesRegistry,
  type ModuleRuntimeShape,
} from "@/types/react-admin-config";

/**
 * Module resources keyed by baseRoute path.
 * Checked with `ModuleResourcesRegistry` so `menuSection` keys match each module’s `menuSections`.
 */
export const MODULE_RESOURCES = {
  bookings: moduleWithSections({
    menuSections: {
      bookings: "Bookings",
      receipts: "Receipts",
      setup: "Setup",
    },
    resources: [
      {
        permission: "bookings.view",
        resource: bookings,
        menuSection: "bookings",
        hideFromMenu: true,
      },
      { permission: "bookings.view", resource: hallBookings, menuSection: "bookings" },
      { permission: "bookings.view", resource: blockedHallDates, menuSection: "bookings" },
      {
        permission: "bookingReceipts.view",
        resource: rentBookingReceipt,
        createPermission: "bookingReceipts.create",
        menuSection: "receipts",
      },
      {
        permission: "lagatReceipts.view",
        resource: lagatReceipt,
        createPermission: "bookingReceipts.create",
        menuSection: "receipts",
      },
      { permission: "halls.view", resource: bookingPurpose, menuSection: "setup" },
      {
        permission: "halls.view",
        resource: halls,
        createPermission: "halls.create",
        menuSection: "setup",
      },
    ],
    customRoutes: [
      { path: "/dep-rcpt/:id", element: DepositReceiptPrint },
      { path: "/raza-print/:id", element: RazaPrint },
      { path: "/confirmation-voucher/:id", element: ConfirmationVoucher },
    ],
  }),
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
  lagat: {
    resources: [
      {
        permission: "lagatReceipts.view",
        resource: lagatReceipt,
        createPermission: "lagatReceipts.create",
      },
    ],
  },
  fmb: moduleWithSections({
    menuSections: {
      kitchen: "Kitchen",
      vendors: "Vendors",
    },
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
      {
        permission: "fmbDish.view",
        resource: fmbDish,
        createPermission: "fmbDish.create",
        menuSection: "kitchen",
      },
      {
        permission: "fmbDailyMenu.view",
        resource: fmbDailyMenu,
        createPermission: "fmbDailyMenu.create",
        menuSection: "kitchen",
      },
      {
        permission: "fmbThaliDistributor.view",
        resource: fmbThaliDistributor,
        createPermission: "fmbThaliDistributor.create",
      },
      {
        permission: "fmbThaliDistribution.view",
        resource: fmbThaliDistributionDailyRun,
      },
      { permission: "fmbThaliSettings.view", resource: fmbThaliSettings },
      {
        permission: "fmbVendor.view",
        resource: fmbVendor,
        createPermission: "fmbVendor.create",
        menuSection: "vendors",
      },
      {
        permission: "fmbVendorPaymentVoucher.view",
        resource: fmbVendorPaymentVoucher,
        createPermission: "fmbVendorPaymentVoucher.create",
        menuSection: "vendors",
      },
    ],
  }),
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
  yearlyNiyaaz: {
    resources: [
      {
        permission: "yearlyNiyaaz.view",
        resource: yearlyNiyaaz,
        createPermission: "yearlyNiyaaz.create",
      },
      {
        permission: "yearlyNiyaazReceipts.view",
        resource: yearlyNiyaazReceipts,
        createPermission: "yearlyNiyaazReceipts.create",
      },
      {
        permission: "yearlyNiyaaz.view",
        resource: yearlyNiyaazSettings,
      },
    ],
    customRoutes: [{ path: "/yn-rcpt/:id", element: YearlyNiyaazReceiptPrint }],
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
} satisfies ModuleResourcesRegistry;

export type ModuleResourcesKey = keyof typeof MODULE_RESOURCES;

export function isModuleResourcesKey(s: string): s is ModuleResourcesKey {
  return Object.prototype.hasOwnProperty.call(MODULE_RESOURCES, s);
}

/** Resolved module bundle for `baseRoute`, or `undefined` if not a configured module. */
export function getModuleRuntimeShape(
  baseRoute: string | null | undefined
): ModuleRuntimeShape | undefined {
  if (baseRoute == null || !isModuleResourcesKey(baseRoute)) {
    return undefined;
  }
  return MODULE_RESOURCES[baseRoute] as ModuleRuntimeShape;
}
