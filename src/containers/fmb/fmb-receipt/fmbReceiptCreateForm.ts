import type { RaRecord } from "react-admin";
import { LINE_KIND } from "./allocation/lineKind";
import type { AllocationFormRow } from "./allocation/types";
import type {
  FmbReceiptApiPayload,
  FmbReceiptFormErrors,
  FmbReceiptFormValues,
} from "./fmbReceiptFormTypes";

function trimId(value: unknown): string {
  if (value == null) {
    return "";
  }
  return typeof value === "string" ? value.trim() : String(value).trim();
}

export function validateFmbReceiptForm(values: FmbReceiptFormValues): FmbReceiptFormErrors {
  const errors: FmbReceiptFormErrors = {};
  if (!values.amountConfirmed) {
    errors.amount = "Confirm the total payment amount before saving.";
  }
  return errors;
}

export function renderFmbReceiptItsOption(choice: RaRecord): string {
  const itsdata = choice.itsdata as Record<string, string | undefined> | undefined;
  const its = choice.itsNo ?? itsdata?.ITS_ID ?? "—";
  const name = itsdata?.Full_Name ?? (choice.name as string | undefined) ?? "—";
  const fmbNoLabel = choice.fileNo ? `File ${String(choice.fileNo)}` : "File —";
  const area = itsdata?.Area ? ` · ${itsdata.Area}` : "";
  const status = choice.closedAt ? " · CLOSED" : "";
  return `${its} · ${name} · ${fmbNoLabel}${area}${status}`;
}

export function transformFmbReceiptPayload(data: FmbReceiptFormValues): FmbReceiptApiPayload {
  const cash = Number(data.amount);
  const creditUsed = Number(data.creditUsed) || 0;
  const amount =
    (Number.isFinite(cash) ? cash : 0) + (Number.isFinite(creditUsed) ? creditUsed : 0);
  const rows: AllocationFormRow[] = Array.isArray(data.allocations) ? data.allocations : [];
  const allocations = rows
    .map((row) => {
      const lineAmt = Number(row?.amount);
      if (!Number.isFinite(lineAmt) || lineAmt < 1) {
        return null;
      }
      const kind =
        row?.lineKind === LINE_KIND.CONTRIBUTION ? LINE_KIND.CONTRIBUTION : LINE_KIND.ANNUAL;
      if (kind === LINE_KIND.CONTRIBUTION) {
        const cid = trimId(row?.fmbContributionId);
        if (!cid) {
          return null;
        }
        return { fmbContributionId: cid, amount: Math.round(lineAmt) };
      }
      const tid = trimId(row?.fmbTakhmeenId);
      if (!tid) {
        return null;
      }
      return { fmbTakhmeenId: tid, amount: Math.round(lineAmt) };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  const out: FmbReceiptApiPayload = {
    fmbId: data.fmbId?.trim() || undefined,
    amount: Number.isFinite(amount) ? Math.round(amount) : 0,
    creditUsed: Number.isFinite(creditUsed) ? Math.round(creditUsed) : 0,
    paymentMode: data.paymentMode ?? "CASH",
    remarks: data.remarks,
    allocations,
  };
  if (data.receiptDate) {
    const d = data.receiptDate instanceof Date ? data.receiptDate : new Date(data.receiptDate);
    if (!Number.isNaN(d.getTime())) {
      out.receiptDate = d.toISOString();
    }
  }
  return out;
}
