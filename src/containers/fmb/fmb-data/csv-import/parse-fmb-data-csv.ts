import * as XLSX from "xlsx";

export type CsvPreviewField =
  | "thaliNo"
  | "itsNo"
  | "name"
  | "deliveryAddress"
  | "thaliType"
  | "mobile"
  | "takhmeen"
  | "tags";

export type FmbDataCsvPreviewRow = {
  rowNumber: number;
  thaliNo: string;
  itsNo: string;
  name: string;
  deliveryAddress: string;
  thaliTypeLabel: string;
  mobile: string;
  /** Parsed takhmeen or null when empty / invalid (invalid adds cell error). */
  takhmeenAmount: number | null;
  tagsRaw: string;
  /** Tags to send to API after successful validation (deduped, capped). */
  tagsParsed: string[];
  cellErrors: Partial<Record<CsvPreviewField, string[]>>;
  rowErrors: string[];
};

export type FmbDataCsvPreviewPayload = {
  rows: FmbDataCsvPreviewRow[];
  skippedEmptyRows: number;
};

export type FmbDataCsvHouseholdBundle = {
  groupKey: string;
  itsNo: string | null;
  name: string;
  mobile: string;
  takhmeenAmount: number;
  thalis: Array<{
    thaliNo: string;
    deliveryAddress: string;
    thaliTypeLabel: string;
    rowNumber: number;
    tags: string[];
  }>;
};

export function normalizeCsvHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function cellToString(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : String(value);
  }
  return String(value).trim();
}

function parseOptionalAmount(value: unknown): { amount: number | null; invalid: boolean } {
  const raw = cellToString(value).replace(/,/g, "");
  if (!raw) return { amount: null, invalid: false };
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return { amount: null, invalid: true };
  return { amount: Math.round(n), invalid: false };
}

/** Split on commas or semicolons; max 50 distinct tags; each max 100 chars (matches API). */
export function parseTagsFromCell(raw: string): { tags: string[]; errors: string[] } {
  const errors: string[] = [];
  const trimmed = raw.trim();
  if (!trimmed) return { tags: [], errors };

  const parts = trimmed
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const p of parts) {
    if (p.length > 100) {
      errors.push(`A tag exceeds 100 characters (starts with: "${p.slice(0, 40)}…").`);
      continue;
    }
    const k = p.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    tags.push(p);
    if (tags.length > 50) {
      errors.push("More than 50 distinct tags are not allowed.");
      return { tags: [], errors };
    }
  }

  return { tags, errors };
}

const HEADER_SYNONYMS: Record<string, string[]> = {
  thaliNo: ["thaali no", "thali no", "thali no.", "thaali no."],
  itsNo: ["its", "its no", "its number", "its id"],
  name: ["name"],
  deliveryAddress: ["address", "delivery address"],
  thaliType: ["thali type", "thaali type", "size"],
  mobile: ["mobile", "mobile no", "mobile number"],
  takhmeenAmount: ["takhmeen amount", "takhmeen"],
  tags: ["tags", "tag", "thali tags", "thaali tags"],
};

function resolveHeaderKeys(headerRow: Record<string, unknown>): Record<string, string> | string[] {
  const keys = Object.keys(headerRow);
  const errors: string[] = [];
  const resolved: Record<string, string> = {};

  (Object.keys(HEADER_SYNONYMS) as (keyof typeof HEADER_SYNONYMS)[]).forEach((field) => {
    const synonyms = HEADER_SYNONYMS[field];
    const match = keys.find((k) => synonyms.includes(normalizeCsvHeader(k)));
    if (!match) {
      if (field === "takhmeenAmount" || field === "tags") return;
      errors.push(
        `Missing required column for "${field}". Expected header one of: ${synonyms.map((s) => `"${s}"`).join(", ")}.`
      );
    } else {
      resolved[field] = match;
    }
  });

  if (errors.length) return errors;
  return resolved;
}

function rowIsEmpty(values: string[]): boolean {
  return values.every((v) => !v.trim());
}

function addCellError(row: FmbDataCsvPreviewRow, field: CsvPreviewField, message: string): void {
  const prev = row.cellErrors[field] ?? [];
  row.cellErrors[field] = [...prev, message];
}

export function isPreviewRowClean(row: FmbDataCsvPreviewRow): boolean {
  const hasCells = Object.values(row.cellErrors).some((a) => a && a.length > 0);
  return !hasCells && row.rowErrors.length === 0;
}

export type FmbThaliTypeForCsv = { id: string; code: string; name: string };

/**
 * Applies duplicate-thali checks and optional thali-type resolution (when `types` is non-null).
 */
export function buildValidatedPreviewRows(
  rows: FmbDataCsvPreviewRow[],
  types: FmbThaliTypeForCsv[] | null,
  resolveThaliTypeId: (label: string, thaliTypes: FmbThaliTypeForCsv[]) => string | undefined
): FmbDataCsvPreviewRow[] {
  const withDup = applyDuplicateThaliIssues(rows.map(clonePreviewRow));
  if (!types) return withDup;
  return withDup.map((row) => {
    const r = clonePreviewRow(row);
    const t = r.thaliTypeLabel.trim();
    if (!t) return r;
    const id = resolveThaliTypeId(t, types);
    if (!id) {
      addCellError(r, "thaliType", `Unknown Thali Type "${t}".`);
    }
    return r;
  });
}

function clonePreviewRow(row: FmbDataCsvPreviewRow): FmbDataCsvPreviewRow {
  return {
    ...row,
    cellErrors: { ...row.cellErrors },
    rowErrors: [...row.rowErrors],
    tagsParsed: [...row.tagsParsed],
  };
}

function applyDuplicateThaliIssues(rows: FmbDataCsvPreviewRow[]): FmbDataCsvPreviewRow[] {
  const byIts = new Map<string, FmbDataCsvPreviewRow[]>();
  for (const r of rows) {
    const k = r.itsNo.trim().toLowerCase();
    if (!k) continue;
    const list = byIts.get(k) ?? [];
    list.push(r);
    byIts.set(k, list);
  }
  for (const [, group] of byIts) {
    const byThali = new Map<string, FmbDataCsvPreviewRow[]>();
    for (const r of group) {
      const tn = r.thaliNo.trim().toLowerCase();
      if (!tn) continue;
      const list = byThali.get(tn) ?? [];
      list.push(r);
      byThali.set(tn, list);
    }
    for (const [, dupRows] of byThali) {
      if (dupRows.length < 2) continue;
      const msg = `Duplicate Thaali No "${dupRows[0]!.thaliNo}" for the same ITS as another row.`;
      for (const r of dupRows) {
        if (!r.rowErrors.includes(msg)) r.rowErrors.push(msg);
      }
    }
  }
  return rows;
}

function buildPreviewRow(
  rowNumber: number,
  row: Record<string, unknown>,
  headerMap: Record<string, string>
): FmbDataCsvPreviewRow {
  const thaliNo = cellToString(row[headerMap.thaliNo]);
  const itsNo = cellToString(row[headerMap.itsNo]);
  const name = cellToString(row[headerMap.name]);
  const deliveryAddress = cellToString(row[headerMap.deliveryAddress]);
  const thaliTypeLabel = cellToString(row[headerMap.thaliType]);
  const mobile = cellToString(row[headerMap.mobile]);
  const takhmeenKey = headerMap.takhmeenAmount;
  const { amount: takhmeenAmount, invalid: takhmeenInvalid } =
    takhmeenKey != null ? parseOptionalAmount(row[takhmeenKey]) : { amount: null, invalid: false };

  const tagsKey = headerMap.tags;
  const tagsRaw = tagsKey != null ? cellToString(row[tagsKey]) : "";
  const { tags: tagsParsed, errors: tagErrors } = parseTagsFromCell(tagsRaw);

  const out: FmbDataCsvPreviewRow = {
    rowNumber,
    thaliNo,
    itsNo,
    name,
    deliveryAddress,
    thaliTypeLabel,
    mobile,
    takhmeenAmount,
    tagsRaw,
    tagsParsed,
    cellErrors: {},
    rowErrors: [],
  };

  if (takhmeenInvalid) {
    addCellError(out, "takhmeen", "Invalid number (use a non-negative integer).");
  }
  for (const te of tagErrors) {
    addCellError(out, "tags", te);
  }

  if (!thaliNo) addCellError(out, "thaliNo", "Required.");
  if (!itsNo.trim()) addCellError(out, "itsNo", "Required.");
  if (!name) addCellError(out, "name", "Required.");
  if (!deliveryAddress) addCellError(out, "deliveryAddress", "Required.");
  if (!thaliTypeLabel) addCellError(out, "thaliType", "Required.");
  if (!mobile) addCellError(out, "mobile", "Required.");

  return out;
}

export function parseFmbDataCsvWorkbookForPreview(
  wb: XLSX.WorkBook
): { ok: true; data: FmbDataCsvPreviewPayload } | { ok: false; errors: string[] } {
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return { ok: false, errors: ["The file has no sheets."] };
  }
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  if (!rows.length) {
    return { ok: false, errors: ["The file has no data rows."] };
  }

  const headerMap = resolveHeaderKeys(rows[0]);
  if (Array.isArray(headerMap)) {
    return { ok: false, errors: headerMap };
  }

  const previewRows: FmbDataCsvPreviewRow[] = [];
  let skippedEmptyRows = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNumber = i + 2;
    const tagsKey = headerMap.tags;
    const tagsRaw = tagsKey != null ? cellToString(row[tagsKey]) : "";
    const thaliNo = cellToString(row[headerMap.thaliNo]);
    const itsNo = cellToString(row[headerMap.itsNo]);
    const name = cellToString(row[headerMap.name]);
    const deliveryAddress = cellToString(row[headerMap.deliveryAddress]);
    const thaliTypeLabel = cellToString(row[headerMap.thaliType]);
    const mobile = cellToString(row[headerMap.mobile]);
    const takhmeenKey = headerMap.takhmeenAmount;
    const takhmeenCell = takhmeenKey != null ? cellToString(row[takhmeenKey]) : "";

    if (
      rowIsEmpty([
        thaliNo,
        itsNo,
        name,
        deliveryAddress,
        thaliTypeLabel,
        mobile,
        tagsRaw,
        takhmeenCell,
      ])
    ) {
      skippedEmptyRows += 1;
      continue;
    }

    previewRows.push(buildPreviewRow(rowNumber, row, headerMap));
  }

  if (!previewRows.length) {
    return { ok: false, errors: ["No data rows found after skipping blank lines."] };
  }

  return { ok: true, data: { rows: previewRows, skippedEmptyRows } };
}

export function previewCanImport(rows: FmbDataCsvPreviewRow[]): boolean {
  return rows.length > 0 && rows.every(isPreviewRowClean);
}

export function previewRowsToBundles(rows: FmbDataCsvPreviewRow[]): FmbDataCsvHouseholdBundle[] {
  const byKey = new Map<string, FmbDataCsvPreviewRow[]>();
  for (const r of rows) {
    const groupKey = `its:${r.itsNo.trim()}`;
    const list = byKey.get(groupKey) ?? [];
    list.push(r);
    byKey.set(groupKey, list);
  }

  const bundles: FmbDataCsvHouseholdBundle[] = [];
  for (const [groupKey, groupRows] of byKey) {
    const itsNo = groupKey.startsWith("its:") ? groupKey.slice(4) : null;
    const name = groupRows.map((x) => x.name.trim()).find(Boolean) ?? "";
    const mobile = groupRows.map((x) => x.mobile.trim()).find(Boolean) ?? "";
    const takhmeenAmount = groupRows.map((x) => x.takhmeenAmount).find((n) => n != null) ?? 0;
    bundles.push({
      groupKey,
      itsNo,
      name,
      mobile,
      takhmeenAmount,
      thalis: groupRows.map((r) => ({
        thaliNo: r.thaliNo.trim(),
        deliveryAddress: r.deliveryAddress.trim(),
        thaliTypeLabel: r.thaliTypeLabel.trim(),
        rowNumber: r.rowNumber,
        tags: r.tagsParsed,
      })),
    });
  }
  return bundles;
}

export async function parseFmbDataCsvFileToPreview(
  file: File
): Promise<{ ok: true; data: FmbDataCsvPreviewPayload } | { ok: false; errors: string[] }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  return parseFmbDataCsvWorkbookForPreview(wb);
}
