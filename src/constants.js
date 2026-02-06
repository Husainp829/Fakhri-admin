// export const apiUrl = "/api";
export const apiUrl = "http://localhost:3012";

export const getApiUrl = () => apiUrl;

export const MARKAZ_LIST = {
  FM: "Fakhri Manzil",
  BH: "Burhani Hall",
};

export const EMPLOYEE_TYPE = {
  FM_STAFF: "FM STAFF",
  BH_STAFF: "BH STAFF",
  FMB_STAFF: "FMB STAFF",
  ROTI_STAFF: "ROTI STAFF",
  ADMIN: "ADMIN",
};

export const PAYMENT_MODE_CONST = {
  cash: "Cash",
  cheque: "Cheque",
  online: "Online",
};
export const Page404 = "Page not found, go home!";

export const getType = (type) => {
  if (type === "MUTTAVATTEEN") {
    return "CHULA";
  }
  return type;
};

export const SABIL_TYPE_OPTIONS = [
  { id: "CHULA", name: "CHULA" },
  { id: "ESTABLISHMENT", name: "ESTABLISHMENT" },
  { id: "MUTTAVATTEEN", name: "MUTTAVATTEEN" },
];

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
