export const apiUrl = "https://jmsapi.rapid-events.com";
// export const apiUrl = "http://localhost:3012";

export const getApiUrl = (resource) =>
  ["bookings", "halls", "hallBookings", "contRcpt", "media", "itsdata"].some((item) =>
    resource.startsWith(item)
  )
    ? `${apiUrl}/v2`
    : apiUrl;

export const permissionsList = [
  { id: "event.view", name: "View Events" },
  { id: "admins.view", name: "View Admin" },
  { id: "view.its.data", name: "View ITS Data" },
  { id: "show.its.dump", name: "Show ITS Data" },
  { id: "niyaaz.view", name: "View Niyaaz" },
  { id: "niyaaz.create", name: "Create Niyaaz" },
  { id: "niyaaz.edit", name: "Edit Niyaaz" },
  { id: "niyaaz.export", name: "Export Niyaaz" },
  { id: "receipt.view", name: "View receipt" },
  { id: "receipt.create", name: "Create receipt" },
  { id: "receipt.edit", name: "Edit receipt" },
  { id: "receipt.export", name: "Export receipt" },
  { id: "dashboard.markaz", name: "Jaman Venue Stats" },
  { id: "dashboard.daywiseReceipt", name: "Day Wise Receipt" },
  { id: "vendors.edit", name: "Vendors Add/Edit/Delete" },
  { id: "vendorTypes.edit", name: "Vendor Types Master" },
  { id: "vendorLedger.edit", name: "Vendor Ledger View/Edit/Delete" },
  { id: "halls.view", name: "Halls View/Edit/Delete" },
  { id: "bookings.view", name: "Bookings View" },
  { id: "bookings.edit", name: "Bookings Edit" },
  { id: "bookings.dashboard", name: "Booking Dashboard" },
  { id: "bookingReceipts.view", name: "Booking Receipts View" },
  { id: "bookingReceipts.edit", name: "Booking Receipts Edit" },
  { id: "writeoff.allow", name: "Has WriteOff" },
  { id: "employees.view", name: "Employees View" },
];

export const MARKAZ_LIST = {
  FM: "Fakhri Manzil",
  BH: "Burhani Hall",
  ZM: "Zainy Masjid Sehen",
};

export const EMPLOYEE_TYPE = {
  FM_STAFF: "FM STAFF",
  BH_STAFF: "BH STAFF",
  FMB_STAFF: "FMB STAFF",
  ROTI_STAFF: "ROTI STAFF",
  ADMIN: "ADMIN",
};

export const NAMAAZ_VENUE = {
  FM: "Fakhri Manzil",
  BH: "Burhani Hall",
  ZM: "Zainy Masjid",
};

export const PAYMENT_MODE_CONST = {
  cash: "Cash",
  cheque: "Cheque",
  online: "Online",
};
export const Page404 = "Page not found, go home!";

export const getType = (type) => {
  if (type === "CHULA" || type === "MUTTAVATTEEN") {
    return "CHULA";
  }
  return "ESTABLISHMENT";
};

export const slotTimeRanges = {
  morning: [7, 10],
  afternoon: [12, 15],
  evening: [17, 23],
};

export const slotNameMap = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export const hallColorMap = {
  BH: "#32CD32",
  "FM-G": "#FF8C00",
  "FM-1": "#FF4500",
  "FM-2": "#1E90FF",
};

export const dateFilterOptions = [
  {
    id: "TODAY",
    name: "Today",
  },
  {
    id: "YESTERDAY",
    name: "Yesterday",
  },
  {
    id: "WEEK_TO_DATE",
    name: "Week to Date",
  },
  {
    id: "MONTH_TO_DATE",
    name: "Month to Date",
  },
  {
    id: "YEAR_TO_DATE",
    name: "Year to Date",
  },
  {
    id: "CURRENT_FINANCIAL_YEAR",
    name: "Financial Year",
  },
  {
    id: "LAST_7_DAYS",
    name: "Last 7 Days",
  },
  {
    id: "LAST_30_DAYS",
    name: "Last 30 Days",
  },
  {
    id: "LAST_90_DAYS",
    name: "Last 90 Days",
  },
  {
    id: "LAST_180_DAYS",
    name: "Last 180 Days",
  },
  {
    id: "LAST_365_DAYS",
    name: "Last 365 Days",
  },
];
