// export const apiUrl = "http://localhost:3012";
export const apiUrl = "https://api.anjumanefakhripoona.org";

export const permissionsList = [
  { id: "admins.view", name: "View Admin" },
  { id: "admins.create", name: "Create Admin" },
  { id: "admins.edit", name: "Edit Admin" },
  { id: "admins.delete", name: "Delete Admin" },
  { id: "view.its.data", name: "View ITS Data" },
];

export const MARKAZ_LIST = {
  ZM: "Zainy Masjid Sehen",
  BH: "Burhani Hall",
  JM: "Jamali Markaz",
};

export const ZABIHAT_UNIT = 4500;
export const CHAIRS_UNIT = 500;
export const HOME_HEADER = "Shehrullah-il-Moazzam 1444H";
export const PASSES_HEADER = "Shehrullah-il-Moazzam 1444H Pass";
export const RECEIPT_HEADER = "Shehrullah-il-Moazzam 1444H Receipt";
export const RECEIPT_LIST_HEADER = "Shehrullah-il-Moazzam 1444 Niyaaz registration receipts";
export const RECEIPT_ADD_HEADER = "Shehrullah-il-Moazzam 1444 new receipt";

export const PAYMENT_MODE_CONST = {
  cash: "Cash",
  cheque: "Cheque",
  online: "Online",
};
export const Page404 = "Page not found, go home!";
export const GrandTotal = "Grand Total";

export const getType = (type) => {
  if (type === "CHULA" || type === "MUTTAVATTEEN") {
    return "CHULA";
  }
  return "ESTABLISHMENT";
};
