export type ThaliRowInput = {
  id?: string;
  thaliNo?: string;
  thaliTypeId?: string | null;
  isActive?: boolean;
  deliveryScheduleProfileId?: string | null;
  useDefaultItsAddress?: boolean;
  deliveryAddress?: string | null;
  deliveryMohallah?: string | null;
  startedAt?: string | Date | null;
  deactivatedAt?: string | Date | null;
  tags?: string[] | null;
};

export type MapThaliRowOptions = { isCreate?: boolean };

export type ThaliRowForApi = {
  id?: string;
  thaliNo: string;
  thaliTypeId?: string;
  isActive: boolean;
  deliveryScheduleProfileId?: string;
  useDefaultItsAddress: boolean;
  deliveryAddress?: string;
  deliveryMohallah?: string;
  startedAt?: string | null;
  deactivatedAt?: string | null;
  tags: string[];
};

function normalizeTagsForApi(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const x of raw) {
    const t = typeof x === "string" ? x.trim() : String(x).trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= 50) break;
  }
  return out;
}

function toYmd(v: unknown): string | null {
  if (v == null || v === "") {
    return null;
  }
  if (v instanceof Date) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "string") {
    return v.slice(0, 10);
  }
  return null;
}

/**
 * Create omits empty dates so API defaults apply; edit sends null to clear bounds.
 */
export function mapThaliRowForApi(
  thali: ThaliRowInput,
  options: MapThaliRowOptions = {}
): ThaliRowForApi {
  const isCreate = options.isCreate === true;
  const base: ThaliRowForApi = {
    id: thali?.id,
    thaliNo: String(thali.thaliNo).trim(),
    thaliTypeId: thali?.thaliTypeId || undefined,
    isActive: thali?.isActive !== false,
    deliveryScheduleProfileId: thali?.deliveryScheduleProfileId || undefined,
    useDefaultItsAddress: thali?.useDefaultItsAddress === true,
    deliveryAddress: thali?.deliveryAddress ? String(thali.deliveryAddress).trim() : undefined,
    deliveryMohallah: thali?.deliveryMohallah ? String(thali.deliveryMohallah).trim() : undefined,
    tags: normalizeTagsForApi(thali?.tags),
  };
  if (isCreate) {
    const s = toYmd(thali?.startedAt);
    const e = toYmd(thali?.deactivatedAt);
    if (s) {
      base.startedAt = s;
    }
    if (e) {
      base.deactivatedAt = e;
    }
  } else {
    base.startedAt =
      thali?.startedAt == null || thali?.startedAt === "" ? null : toYmd(thali.startedAt);
    base.deactivatedAt =
      thali?.deactivatedAt == null || thali?.deactivatedAt === ""
        ? null
        : toYmd(thali.deactivatedAt);
  }
  return base;
}

export const validateThalis = (value: unknown): string | undefined => {
  if (!Array.isArray(value) || value.length === 0) {
    return "Add at least one thali";
  }

  const hasInvalid = value.some((thali) => !thali?.thaliNo || !String(thali.thaliNo).trim());
  if (hasInvalid) {
    return "Each thali requires a thali number";
  }

  const missingType = value.some(
    (thali) => thali?.thaliTypeId == null || String(thali.thaliTypeId).trim() === ""
  );
  if (missingType) {
    return "Each thali must have a thali type";
  }

  const activeCount = value.filter((thali) => thali?.isActive !== false).length;
  if (activeCount === 0) {
    return "Keep at least one active thali";
  }

  return undefined;
};
