import type { FmbThaliRow } from "./AddThalisDialog";

export interface AssignmentRow {
  id?: string;
  fmbThaliId?: string;
  fmbThali?: FmbThaliRow;
}

/** Single-line delivery location for tables and search (address + mohallah). */
export function thaliDeliveryLine(t: FmbThaliRow | null | undefined): string {
  if (!t) return "";
  const parts = [t.deliveryAddress, t.deliveryMohallah]
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
  return parts.join(" — ");
}

export function thaliLabel(t: FmbThaliRow): string {
  const thaliNo = t?.thaliNo ?? "—";
  const its = t?.fmb?.itsNo ?? "—";
  const name = t?.fmb?.name ?? "—";
  const addr = thaliDeliveryLine(t) || "—";
  return `${thaliNo} · ITS ${its} · ${name} · ${addr}`;
}

export function assignmentThaliId(a: AssignmentRow): string | undefined {
  const id = a?.fmbThaliId ?? a?.fmbThali?.id;
  return id ? String(id) : undefined;
}

/**
 * Stable group key for thali type breakdown. When `thaliType.id` is omitted from the API
 * payload, every row must not share a single `__none` bucket — use name/code so Medium vs
 * Small stay distinct.
 */
function assignmentThaliTypeGroupKey(tt: FmbThaliRow["thaliType"] | null | undefined): string {
  if (!tt) return "__none";
  const rawId = tt.id != null ? String(tt.id).trim() : "";
  if (rawId) return `id:${rawId}`;
  const name = (tt.name ?? "").trim().toLowerCase();
  const code = (tt.code ?? "").trim().toLowerCase();
  if (name || code) return `label:${name}\0${code}`;
  return "__none";
}

/** Counts assigned thalis by `fmbThali.thaliType`. */
export function buildAssignedThaliTypeBreakdown(
  rows: AssignmentRow[]
): { id: string; name: string; count: number }[] {
  const byKey = new Map<string, { name: string; count: number }>();
  for (const a of rows) {
    const tt = a?.fmbThali?.thaliType;
    const key = assignmentThaliTypeGroupKey(tt);
    const label = (tt?.name?.trim() || tt?.code?.trim() || "Unspecified").trim() || "Unspecified";
    const prev = byKey.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      byKey.set(key, { name: label, count: 1 });
    }
  }
  return [...byKey.entries()]
    .map(([id, v]) => ({ id, name: v.name, count: v.count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function filterAssignmentsByQuery(
  assignments: AssignmentRow[],
  assignedFilter: string
): AssignmentRow[] {
  const q = assignedFilter.trim().toLowerCase();
  if (!q) return assignments;
  return assignments.filter((a) => {
    const t = a?.fmbThali;
    const typeHay = (t?.thaliType?.name?.trim() || t?.thaliType?.code?.trim() || "").toLowerCase();
    const tagsHay = (t?.tags ?? []).join(" ").toLowerCase();
    const haystack = t
      ? `${thaliLabel(t)} ${typeHay} ${tagsHay}`.toLowerCase()
      : String(a?.fmbThaliId ?? "").toLowerCase();
    return haystack.includes(q);
  });
}
