export const apiUrl = "https://jmsapi.rapid-events.com";

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
  { id: "bookings.view", name: "Bookings View/Edit" },
  { id: "writeoff.allow", name: "Has WriteOff" },
  { id: "employees.view", name: "Employees View" },
];

export const MARKAZ_LIST = {
  FM: "Fakhri Manzil",
  BH: "Burhani Hall",
  ZM: "Zainy Masjid Sehen",
};

export const EMPLOYEE_TYPE = {
  FM_STAFF: "FM_STAFF",
  BH_STAFF: "BH_STAFF",
  FMB_STAFF: "FMB_STAFF",
  ROTI_STAFF: "ROTI_STAFF",
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
