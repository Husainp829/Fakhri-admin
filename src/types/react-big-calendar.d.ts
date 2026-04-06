declare module "react-big-calendar" {
  type DateRangeFormatFnArgs = { start: Date; end: Date };

  export class DateLocalizer {
    constructor(spec: Record<string, unknown>);
  }
}
