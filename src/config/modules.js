/**
 * Central module registry for dashboards and navigation.
 * Add new modules here to extend DefaultDashboard and DashboardAdmin.
 */
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import BadgeIcon from "@mui/icons-material/Badge";
import FestivalIcon from "@mui/icons-material/Festival";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

import BookingDashboard from "../containers/bookings/dashboard";
import EventsDashboard from "../containers/events/dashboard";
import ActiveEventDashboard from "../containers/events/eventDashboard";
import StaffDashboard from "../containers/staff/dashboard";
import SabilDashboard from "../containers/sabil/dashboard";
import FmbDashboard from "../containers/fmb/dashboard";
import MiqaatDashboard from "../containers/miqaat/dashboard";
import AccountsDashboard from "../containers/accounts/dashboard";

/**
 * Fallback when user lacks dashboard permission
 * @typedef {"navigate" | "defaultDashboard"} FallbackType
 * @property {FallbackType} type - "navigate" redirects to path, "defaultDashboard" shows DefaultDashboard
 * @property {string|null} path - Required when type is "navigate"
 */
const FALLBACK_NAVIGATE = (path) => ({ type: "navigate", path });
const FALLBACK_DEFAULT = { type: "defaultDashboard", path: null };

/**
 * Module registry for DefaultDashboard cards and DashboardAdmin routing.
 * Order determines display order in DefaultDashboard.
 */
export const MODULE_REGISTRY = [
  {
    id: "bookings",
    path: "bookings",
    label: "Bookings",
    description: "View and manage all hall bookings",
    icon: BookOnlineIcon,
    permission: "bookings.view",
    dashboardPermission: "bookings.dashboard",
    fallback: FALLBACK_NAVIGATE("/hallBookings"),
    dashboard: BookingDashboard,
  },
  {
    id: "events",
    path: "events",
    label: "Events",
    description: "View and manage all events",
    icon: FestivalIcon,
    permission: "event.view",
    dashboardPermission: null,
    fallback: FALLBACK_DEFAULT,
    hasChildDashboard: true,
    dashboard: EventsDashboard,
    childDashboard: ActiveEventDashboard,
  },
  {
    id: "staff",
    path: "staff",
    label: "Staff",
    description: "View and manage all staff",
    icon: BadgeIcon,
    permission: "employees.view",
    dashboardPermission: "staff.dashboard",
    fallback: FALLBACK_NAVIGATE("/employees"),
    dashboard: StaffDashboard,
  },
  {
    id: "sabil",
    path: "sabil",
    label: "Sabil",
    description: "View and manage all sabil data",
    icon: BadgeIcon,
    permission: "sabil.view",
    dashboardPermission: "sabil.dashboard",
    fallback: FALLBACK_NAVIGATE("/sabilData"),
    dashboard: SabilDashboard,
  },
  {
    id: "fmb",
    path: "fmb",
    label: "FMB",
    description: "View and manage all fmb data",
    icon: TableRowsIcon,
    permission: "admins.view",
    dashboardPermission: "admins.view",
    fallback: FALLBACK_NAVIGATE("/fmbData"),
    dashboard: FmbDashboard,
  },
  {
    id: "miqaat",
    path: "miqaat",
    label: "Miqaat Niyaaz Receipts",
    description: "View and manage all miqaat niyaaz receipts",
    icon: ReceiptIcon,
    permission: "miqaatNiyaazReceipts.view",
    dashboardPermission: "miqaatNiyaazReceipts.dashboard",
    fallback: FALLBACK_NAVIGATE("/miqaatNiyaazReceipts"),
    dashboard: MiqaatDashboard,
  },
  {
    id: "accounts",
    path: "accounts",
    label: "Accounts",
    description: "View and manage all accounts",
    icon: AccountBalanceIcon,
    permission: "accounts.view",
    dashboardPermission: "accounts.view",
    fallback: FALLBACK_DEFAULT,
    dashboard: AccountsDashboard,
  },
];

/**
 * Get module config by base route path
 */
export const getModuleByPath = (path) => MODULE_REGISTRY.find((m) => m.path === path);
