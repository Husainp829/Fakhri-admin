/**
 * Card configuration for LagatDashboard.
 * Add new cards here to extend the Lagat dashboard.
 */
import ReceiptIcon from "@mui/icons-material/Receipt";
import type { SvgIconComponent } from "@mui/icons-material";

export type LagatDashboardCard = {
  permission: string;
  icon: SvgIconComponent;
  label: string;
  description: string;
  path: string;
};

export const LAGAT_DASHBOARD_CARDS: LagatDashboardCard[] = [
  {
    permission: "lagatReceipts.view",
    icon: ReceiptIcon,
    label: "Lagat Receipts",
    description: "View and manage all lagat receipts",
    path: "lagatReceipts",
  },
];
