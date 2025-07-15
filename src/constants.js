// export const apiUrl = "http://localhost:3012";
export const apiUrl = "https://jmsapi.rapid-events.com";

export const permissionsList = [
  { id: "admins.view", name: "View Admin" },
  { id: "view.its.data", name: "View ITS Data" },
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
];

export const MARKAZ_LIST = {
  FM: "Fakhri Manzil",
  BH: "Burhani Hall",
  ZM: "Zainy Masjid Sehen",
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

export const PER_THAAL_COST = 110;
