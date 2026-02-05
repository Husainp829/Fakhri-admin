/**
 * Auth-less routes (noLayout) - receipt prints, forgot password, etc.
 */
import Receipt from "../containers/events/receipt/receiptPrint";
import RentReceiptPrint from "../containers/bookings/rentBookingReceipt/rentReceiptPrint";
import LagatReceiptPrint from "../containers/lagatReceipt/lagatReceiptPrint";
import MiqaatNiyaazReceiptPrint from "../containers/miqaat/miqaatNiyaazReceipts/miqaatNiyaazReceiptPrintA5";
import ForgotPassword from "../layout/forgotPassword";
import SabilReceipt from "../containers/sabil/sabilReceipt/sabilReceiptPrint";
import FmbReceipt from "../containers/fmb/fmbReceipt/fmbReceiptPrint";

export const AUTHLESS_ROUTES = [
  { path: "/niyaaz-receipt", element: Receipt },
  { path: "/cont-rcpt/:id", element: RentReceiptPrint },
  { path: "/lagat-rcpt/:id", element: LagatReceiptPrint },
  { path: "/mqt-rcpt/:id", element: MiqaatNiyaazReceiptPrint },
  { path: "/forgot-password", element: ForgotPassword },
  { path: "/sabil-receipt", element: SabilReceipt },
  { path: "/fmb-receipt", element: FmbReceipt },
];
