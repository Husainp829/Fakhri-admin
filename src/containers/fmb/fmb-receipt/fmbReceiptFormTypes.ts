import type { AllocationFormRow } from "./allocation/types";

export interface FmbReceiptFormValues {
  fmbId?: string;
  name?: string;
  amount?: unknown;
  creditUsed?: unknown;
  amountConfirmed?: boolean;
  allocations?: AllocationFormRow[];
  receiptDate?: Date | string;
  paymentMode?: string;
  remarks?: string;
}

export type FmbReceiptAllocationApi =
  | { fmbContributionId: string; amount: number }
  | { fmbTakhmeenId: string; amount: number };

export interface FmbReceiptApiPayload {
  fmbId?: string;
  amount: number;
  creditUsed: number;
  paymentMode: string;
  remarks?: string;
  allocations: FmbReceiptAllocationApi[];
  receiptDate?: string;
}

/** React-admin form validation return shape */
export type FmbReceiptFormErrors = Record<string, string | undefined>;
