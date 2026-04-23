import type { ReactNode } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MUI_ADAPTER_DATE_FORMATS } from "@/utils/date-format";

/** Wraps MUI X pickers with Dayjs + app-wide date display formats. */
export function AppDatePickerLocalization({ children }: { children: ReactNode }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} dateFormats={MUI_ADAPTER_DATE_FORMATS}>
      {children}
    </LocalizationProvider>
  );
}
