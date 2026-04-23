import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";

export type ResourceCalendarShellOptions = {
  isMobile: boolean;
  sidebarOpen: boolean;
};

/** Width/height shell shared by resource calendars in the admin layout. */
export function resourceCalendarShellSx({
  isMobile,
  sidebarOpen,
}: ResourceCalendarShellOptions): SystemStyleObject<Theme> {
  return {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    width: isMobile ? "95vw" : sidebarOpen ? "calc(100vw - 255px)" : "calc(100vw - 65px)",
    height: isMobile ? "100dvh" : "calc(100vh - 8vh)",
    maxWidth: "100%",
  };
}
