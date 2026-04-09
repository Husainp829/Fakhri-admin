import { formatINR } from "@/utils";
import { LINE_KIND } from "./lineKind";
import type {
  AllocationFormRow,
  AllocationMetaEntry,
  FmbContributionListRecord,
  FmbTakhmeenListRecord,
  PreferredAllocationRef,
} from "./types";

function asTrimmedId(value: unknown): string {
  if (value == null) {
    return "";
  }
  return typeof value === "string" ? value.trim() : String(value).trim();
}

export function pickAnnualPendingAmount(
  choice: FmbTakhmeenListRecord | null | undefined
): number | null {
  if (!choice) {
    return null;
  }
  if (choice.takhmeenPendingAmount != null) {
    return Number(choice.takhmeenPendingAmount) || 0;
  }
  if (choice.balancePending != null) {
    return Number(choice.balancePending) || 0;
  }
  if (choice.pendingBalance != null) {
    return Number(choice.pendingBalance) || 0;
  }
  if (choice.pendingAmount != null) {
    return Number(choice.pendingAmount) || 0;
  }
  if (choice.takhmeenAmount != null) {
    return Number(choice.takhmeenAmount) || 0;
  }
  return null;
}

export function pickContributionPendingAmount(
  choice: FmbContributionListRecord | null | undefined
): number | null {
  if (!choice) {
    return null;
  }
  if (choice.contributionPendingAmount != null) {
    return Number(choice.contributionPendingAmount) || 0;
  }
  const total = Number(choice.amount);
  const paid = Number(choice.receiptsPaidTotal) || 0;
  if (Number.isFinite(total)) {
    return Math.max(0, total - paid);
  }
  return null;
}

export function annualRowLabel(t: Partial<FmbTakhmeenListRecord>): string {
  const a = t.hijriYearStart ?? "—";
  const b = t.hijriYearEnd ?? "—";
  return `${a}–${b} · commit ${formatINR(t.takhmeenAmount, { empty: "—" })}`;
}

export function contributionRowLabel(c: Partial<FmbContributionListRecord>): string {
  const paid = c.receiptsPaidTotal ?? 0;
  const pending =
    c.contributionPendingAmount != null
      ? c.contributionPendingAmount
      : Math.max(0, Number(c.amount ?? 0) - Number(paid));
  const bn = typeof c.beneficiaryName === "string" ? c.beneficiaryName.trim() : "";
  const who = bn ? `${c.beneficiaryItsNo ?? "—"} (${bn})` : String(c.beneficiaryItsNo ?? "—");
  return `${c.contributionType ?? "—"} · ITS ${who} · due ${formatINR(pending)}`;
}

export function buildPendingAllocationsFromLists(
  takhmeenList: FmbTakhmeenListRecord[] | null | undefined,
  contributionsList: FmbContributionListRecord[] | null | undefined
): { rows: AllocationFormRow[]; meta: AllocationMetaEntry[] } {
  const rows: AllocationFormRow[] = [];
  const meta: AllocationMetaEntry[] = [];
  (takhmeenList ?? []).forEach((t) => {
    const pending = pickAnnualPendingAmount(t);
    if (pending != null && pending > 0) {
      meta.push({ kind: LINE_KIND.ANNUAL, record: t });
      rows.push({
        lineKind: LINE_KIND.ANNUAL,
        fmbTakhmeenId: t.id,
        fmbContributionId: null,
        amount: "",
      });
    }
  });
  (contributionsList ?? []).forEach((c) => {
    const pending = pickContributionPendingAmount(c);
    if (pending != null && pending > 0) {
      meta.push({ kind: LINE_KIND.CONTRIBUTION, record: c });
      rows.push({
        lineKind: LINE_KIND.CONTRIBUTION,
        fmbContributionId: c.id,
        fmbTakhmeenId: null,
        amount: "",
      });
    }
  });
  return { rows, meta };
}

export function applyMaxSuggestedAmounts(
  rows: AllocationFormRow[],
  meta: AllocationMetaEntry[],
  totalPayment: unknown
): AllocationFormRow[] {
  let remaining = Math.max(0, Number(totalPayment) || 0);
  return rows.map((row, i) => {
    const m = meta[i];
    if (!m) {
      return row;
    }
    const pendingCap =
      m.kind === LINE_KIND.CONTRIBUTION
        ? pickContributionPendingAmount(m.record as FmbContributionListRecord)
        : pickAnnualPendingAmount(m.record as FmbTakhmeenListRecord);
    const cap =
      pendingCap != null && Number.isFinite(pendingCap) ? Math.max(0, pendingCap) : remaining;
    const suggested = Math.min(remaining, cap);
    remaining -= suggested;
    return {
      ...row,
      amount: suggested > 0 ? suggested : "",
    };
  });
}

/** Standalone receipt (no FMB): put the full payment on the first template row. */
export function seedStandaloneTemplateRows(
  rows: AllocationFormRow[],
  totalPayment: unknown
): AllocationFormRow[] {
  const t = Math.max(0, Number(totalPayment) || 0);
  if (!rows.length) {
    return [];
  }
  return rows.map((row, i) =>
    i === 0 ? { ...row, amount: t > 0 ? t : "" } : { ...row, amount: "" }
  );
}

export function cloneAllocationTemplate(rows: AllocationFormRow[]): AllocationFormRow[] {
  return rows.map((r) => ({
    ...r,
    amount: r.amount === undefined || r.amount === null ? "" : r.amount,
  }));
}

export function getPreferredAllocationFromTemplate(
  allocationTemplate: AllocationFormRow[] | null | undefined
): PreferredAllocationRef | null {
  const first = Array.isArray(allocationTemplate) ? allocationTemplate[0] : null;
  const kind =
    first?.lineKind === LINE_KIND.CONTRIBUTION ? LINE_KIND.CONTRIBUTION : LINE_KIND.ANNUAL;
  const contributionId = asTrimmedId(first?.fmbContributionId);
  const takhmeenId = asTrimmedId(first?.fmbTakhmeenId);

  if (kind === LINE_KIND.CONTRIBUTION && contributionId) {
    return { kind, id: contributionId };
  }
  if (kind === LINE_KIND.ANNUAL && takhmeenId) {
    return { kind, id: takhmeenId };
  }
  return null;
}

export function prioritizePreferredAllocation(
  rows: AllocationFormRow[],
  meta: AllocationMetaEntry[],
  preferred: PreferredAllocationRef | null,
  takhmeenList: FmbTakhmeenListRecord[] | null | undefined,
  contributionsList: FmbContributionListRecord[] | null | undefined
): { rows: AllocationFormRow[]; meta: AllocationMetaEntry[] } {
  if (!preferred) {
    return { rows, meta };
  }

  const matchIndex = meta.findIndex((m) => {
    if (preferred.kind === LINE_KIND.CONTRIBUTION) {
      return m?.kind === LINE_KIND.CONTRIBUTION && String(m?.record?.id) === preferred.id;
    }
    return m?.kind === LINE_KIND.ANNUAL && String(m?.record?.id) === preferred.id;
  });

  if (matchIndex >= 0) {
    const newRows = [...rows];
    const newMeta = [...meta];
    const [r] = newRows.splice(matchIndex, 1);
    const [m] = newMeta.splice(matchIndex, 1);
    return { rows: [r, ...newRows], meta: [m, ...newMeta] };
  }

  // Preferred target isn't pending (or not in list) — still put it first so "Apply" / manual entry hits it first.
  if (preferred.kind === LINE_KIND.CONTRIBUTION) {
    const rec =
      (contributionsList ?? []).find((c) => String(c?.id) === preferred.id) ||
      ({ id: preferred.id } satisfies FmbContributionListRecord);
    return {
      rows: [
        {
          lineKind: LINE_KIND.CONTRIBUTION,
          fmbContributionId: preferred.id,
          fmbTakhmeenId: null,
          amount: "",
        },
        ...rows,
      ],
      meta: [{ kind: LINE_KIND.CONTRIBUTION, record: rec }, ...meta],
    };
  }

  const rec =
    (takhmeenList ?? []).find((t) => String(t?.id) === preferred.id) ||
    ({ id: preferred.id } satisfies FmbTakhmeenListRecord);
  return {
    rows: [
      {
        lineKind: LINE_KIND.ANNUAL,
        fmbTakhmeenId: preferred.id,
        fmbContributionId: null,
        amount: "",
      },
      ...rows,
    ],
    meta: [{ kind: LINE_KIND.ANNUAL, record: rec }, ...meta],
  };
}

export function computeRemainingForRow(
  allocations: AllocationFormRow[] | null | undefined,
  rowIndex: number,
  totalPayment: unknown
): number {
  const total = Math.max(0, Number(totalPayment) || 0);
  const rows = Array.isArray(allocations) ? allocations : [];
  const otherSum = rows.reduce((s, r, i) => (i === rowIndex ? s : s + (Number(r?.amount) || 0)), 0);
  return Math.max(0, total - otherSum);
}
