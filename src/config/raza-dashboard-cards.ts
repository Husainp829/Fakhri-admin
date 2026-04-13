/**
 * Card configuration for Raza dashboard (raza requests + lagat receipts).
 */
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import type { SvgIconComponent } from "@mui/icons-material";

export type RazaDashboardCard = {
  permission: string;
  icon: SvgIconComponent;
  label: string;
  description: string;
  path: string;
};

export const RAZA_DASHBOARD_CARDS: RazaDashboardCard[] = [
  {
    permission: "razaRequests.view",
    icon: AssignmentTurnedInIcon,
    label: "Raza requests",
    description: "View and manage raza requests",
    path: "razaRequests",
  },
  {
    permission: "lagatReceipts.view",
    icon: ReceiptIcon,
    label: "Lagat receipts",
    description: "View and manage lagat receipts",
    path: "lagatReceipts",
  },
];
