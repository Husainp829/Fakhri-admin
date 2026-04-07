const DEFAULT_API_URL = "https://jms.anjumanefakhripoona.org/api";

function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv != null && String(fromEnv).trim() !== "") {
    return String(fromEnv).replace(/\/$/, "");
  }
  return DEFAULT_API_URL;
}

/** API origin including `/api` path (no trailing slash). Set `VITE_API_URL` at build time (e.g. CI). */
export const apiUrl = resolveApiBaseUrl();

/** Cached raw `themeOptions` from `GET /tenant-branding/me` (session only). */
export const TENANT_BRANDING_THEME_STORAGE_KEY = "tenantBrandingThemeOptions";

/** @param _resource Ignored; API base is single origin. Kept for call-site compatibility. */
export const getApiUrl = (_resource?: string): string => apiUrl;

export const MARKAZ_LIST: Record<string, string> = {
  FM: "Fakhri Manzil",
  BH: "Burhani Hall",
};

export const EMPLOYEE_TYPE: Record<string, string> = {
  FM_STAFF: "FM STAFF",
  BH_STAFF: "BH STAFF",
  FMB_STAFF: "FMB STAFF",
  ROTI_STAFF: "ROTI STAFF",
  ADMIN: "ADMIN",
};

export const PAYMENT_MODE_CONST: Record<string, string> = {
  cash: "Cash",
  cheque: "Cheque",
  online: "Online",
};

export const Page404 = "Page not found, go home!";

export const getType = (type: string): string => {
  if (type === "MUTTAVATTEEN") {
    return "CHULA";
  }
  return type;
};

export const SABIL_TYPE_OPTIONS: { id: string; name: string }[] = [
  { id: "CHULA", name: "CHULA" },
  { id: "ESTABLISHMENT", name: "ESTABLISHMENT" },
  { id: "MUTTAVATTEEN", name: "MUTTAVATTEEN" },
];

export const slotTimeRanges: Record<string, [number, number]> = {
  morning: [7, 10],
  afternoon: [12, 15],
  evening: [17, 23],
};

export const slotNameMap: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export const hallColorMap: Record<string, string> = {
  BH: "#32CD32",
  "FM-G": "#FF8C00",
  "FM-1": "#FF4500",
  "FM-2": "#1E90FF",
};

export const dateFilterOptions: { id: string; name: string }[] = [
  { id: "TODAY", name: "Today" },
  { id: "YESTERDAY", name: "Yesterday" },
  { id: "WEEK_TO_DATE", name: "Week to Date" },
  { id: "MONTH_TO_DATE", name: "Month to Date" },
  { id: "YEAR_TO_DATE", name: "Year to Date" },
  { id: "CURRENT_FINANCIAL_YEAR", name: "Financial Year" },
  { id: "LAST_7_DAYS", name: "Last 7 Days" },
  { id: "LAST_30_DAYS", name: "Last 30 Days" },
  { id: "LAST_90_DAYS", name: "Last 90 Days" },
  { id: "LAST_180_DAYS", name: "Last 180 Days" },
  { id: "LAST_365_DAYS", name: "Last 365 Days" },
];
