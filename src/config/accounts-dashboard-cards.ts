/**
 * Card configuration for AccountsDashboard.
 * Add new cards here to extend the Accounts dashboard.
 */
import ReceiptIcon from "@mui/icons-material/Receipt";
import type { SvgIconComponent } from "@mui/icons-material";

export type AccountsDashboardCard = {
  permission: string;
  icon: SvgIconComponent;
  label: string;
  description: string;
  path: string;
};

export const ACCOUNTS_DASHBOARD_CARDS: AccountsDashboardCard[] = [
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
