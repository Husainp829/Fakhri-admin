import type { LineKind } from "./lineKind";

export type AllocationAmount = string | number;

export interface AllocationFormRow {
  lineKind: LineKind;
  fmbTakhmeenId: string | number | null;
  fmbContributionId: string | number | null;
  amount: AllocationAmount;
}

/** Shape of fmbTakhmeen list rows used when building allocations */
export interface FmbTakhmeenListRecord {
  id: string | number;
  hijriYearStart?: unknown;
  hijriYearEnd?: unknown;
  takhmeenAmount?: unknown;
  takhmeenPendingAmount?: unknown;
  balancePending?: unknown;
  pendingBalance?: unknown;
  pendingAmount?: unknown;
}

/** Shape of fmbContributions list rows used when building allocations */
export interface FmbContributionListRecord {
  id: string | number;
  amount?: unknown;
  receiptsPaidTotal?: unknown;
  contributionPendingAmount?: unknown;
  beneficiaryName?: string | null;
  beneficiaryItsNo?: string | number | null;
  contributionType?: string | null;
}

export interface AllocationMetaEntry {
  kind: LineKind;
  record: FmbTakhmeenListRecord | FmbContributionListRecord;
}

export interface PreferredAllocationRef {
  kind: LineKind;
  id: string;
}
