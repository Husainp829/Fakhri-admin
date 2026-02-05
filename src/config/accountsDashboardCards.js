/**
 * Card configuration for AccountsDashboard.
 * Add new cards here to extend the Accounts dashboard.
 */
import ReceiptIcon from "@mui/icons-material/Receipt";

export const ACCOUNTS_DASHBOARD_CARDS = [
  {
    permission: "sabilReceipts.view",
    icon: ReceiptIcon,
    label: "Sabil Receipts",
    description: "View and manage all sabil receipts",
    path: "sabilReceipt",
  },
  {
    permission: "lagatReceipts.view",
    icon: ReceiptIcon,
    label: "Lagat Receipts",
    description: "View and manage all lagat receipts",
    path: "lagatReceipts",
  },
  {
    permission: "bookingReceipts.view",
    icon: ReceiptIcon,
    label: " Booking Receipts",
    description: "View and manage all booking receipts",
    path: "contRcpt",
  },
];
