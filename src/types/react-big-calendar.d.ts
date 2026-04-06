declare module "react-big-calendar" {
  import type { ComponentType, CSSProperties } from "react";

  type DateRangeFormatFnArgs = { start: Date; end: Date };

  export class DateLocalizer {
    constructor(spec: Record<string, unknown>);
  }

  export type View = "month" | "week" | "day" | "work_week" | "agenda";

  export const Views: {
    MONTH: "month";
    WEEK: "week";
    DAY: "day";
    WORK_WEEK: "work_week";
    AGENDA: "agenda";
  };

  /** Minimal typing for Calendar; extend as needed when tightening types. */
  export const Calendar: ComponentType<Record<string, unknown>>;

  export type ToolbarProps = Record<string, unknown> & {
    label: string;
    onNavigate: (action: string, newDate?: Date) => void;
    date: Date;
    view: string;
    onView: (view: string) => void;
  };

  export type EventPropGetter<T = unknown> = (
    event: T,
    start: Date,
    end: Date,
    isSelected: boolean
  ) => { className?: string; style?: CSSProperties };

  export type Components<TEvent = unknown> = {
    event?: ComponentType<{ event: TEvent }>;
    toolbar?: ComponentType<ToolbarProps>;
    month?: { dateHeader?: ComponentType<{ date: Date; onDrillDown: () => void }> };
    week?: { header?: ComponentType<{ date: Date; onDrillDown: () => void }> };
  };
}
