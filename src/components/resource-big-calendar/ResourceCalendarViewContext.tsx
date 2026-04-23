import { createContext, useContext, type ReactNode } from "react";
import type { View } from "react-big-calendar";

const ResourceCalendarViewContext = createContext<View>("month");

export function ResourceCalendarViewProvider({
  view,
  children,
}: {
  view: View;
  children: ReactNode;
}) {
  return (
    <ResourceCalendarViewContext.Provider value={view}>
      {children}
    </ResourceCalendarViewContext.Provider>
  );
}

export function useResourceCalendarView(): View {
  return useContext(ResourceCalendarViewContext);
}
