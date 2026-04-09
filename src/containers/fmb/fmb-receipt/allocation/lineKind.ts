export const LINE_KIND = {
  ANNUAL: "ANNUAL",
  CONTRIBUTION: "CONTRIBUTION",
} as const;

export type LineKind = (typeof LINE_KIND)[keyof typeof LINE_KIND];
