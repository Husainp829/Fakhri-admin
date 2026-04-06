/**
 * Auth-less routes (noLayout) - receipt prints, forgot password, etc.
 */
import Receipt from "@/containers/events/receipt/ReceiptPrint";
import RentReceiptPrint from "@/containers/bookings/rent-booking-receipt/RentReceiptPrint";
import LagatReceiptPrint from "@/containers/lagat-receipt/LagatReceiptPrint";
import MiqaatNiyaazReceiptPrint from "@/containers/miqaat/miqaat-niyaaz-receipts/MiqaatNiyaazReceiptPrintA5";
import ForgotPassword from "@/layout/ForgotPassword";
import SabilReceipt from "@/containers/sabil/sabil-receipt/SabilReceiptPrint";
import FmbReceipt from "@/containers/fmb/fmb-receipt/FmbReceiptPrint";

import type { AuthlessRouteConfig } from "@/types/react-admin-config";

export const AUTHLESS_ROUTES: AuthlessRouteConfig[] = [
  { path: "/niyaaz-receipt", element: Receipt },
  { path: "/cont-rcpt/:id", element: RentReceiptPrint },
  { path: "/lagat-rcpt/:id", element: LagatReceiptPrint },
  { path: "/mqt-rcpt/:id", element: MiqaatNiyaazReceiptPrint },
  { path: "/forgot-password", element: ForgotPassword },
  { path: "/sabil-receipt", element: SabilReceipt },
  { path: "/fmb-receipt", element: FmbReceipt },
];
