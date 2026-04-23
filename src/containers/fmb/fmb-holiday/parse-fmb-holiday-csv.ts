import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { DatePattern, formatIsoDate } from "@/utils/date-format";

dayjs.extend(utc);

const DATE_HEADER_KEYS = [
  "holidaydate",
  "holiday_date",
  "date",
  "day",
  "calendardate",
  "calendar_date",
];

const NAME_HEADER_KEYS = [
  "name",
  "holidayname",
  "holiday_name",
  "holiday",
  "label",
  "title",
  "description",
  "notes",
  "remark",
];

export type ParsedFmbHolidayRow = {
  holidayDateYmd: string;
  name: string | null;
  /** 1-based row number in the original CSV (header is row 1). */
  sourceRowNumber: number;
};

export type FmbHolidayCsvParseError = {
  rowNumber: number;
  message: string;
};

export type ParseFmbHolidayCsvResult = {
  rows: ParsedFmbHolidayRow[];
  parseErrors: FmbHolidayCsvParseError[];
  skippedBlankRows: number;
  detectedDateHeader: string;
  detectedNameHeader: string | null;
};

function isValidYmdUtc(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.trim())) {
    return false;
  }
  return dayjs.utc(s.trim(), DatePattern.ISO_DATE, true).isValid();
}

function normalizeHeader(cell: string): string {
  return cell.trim().replace(/^"|"$/g, "").trim();
}

function normalizeHeaderKey(cell: string): string {
  return normalizeHeader(cell)
    .toLowerCase()
    .replace(/[\s-_]/g, "");
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (!inQ && c === ",") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsvGrid(content: string): string[][] {
  const text = content.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map(parseCsvLine);
}

const SLASH_FORMATS_DD = ["DD/MM/YYYY", "D/M/YYYY", "DD/MM/YY", "D/M/YY"] as const;
const SLASH_FORMATS_US = ["MM/DD/YYYY", "M/D/YYYY", "MM/DD/YY", "M/D/YY"] as const;

/**
 * Parse a single cell into canonical `YYYY-MM-DD`, or null if empty / unparseable.
 */
export function parseHolidayDateCell(raw: string): string | null {
  const t = raw.trim();
  if (!t) {
    return null;
  }
  if (isValidYmdUtc(t)) {
    return t.trim();
  }
  for (const fmt of SLASH_FORMATS_DD) {
    const d = dayjs.utc(t, fmt, true);
    if (d.isValid()) {
      return formatIsoDate(d);
    }
  }
  for (const fmt of SLASH_FORMATS_US) {
    const d = dayjs.utc(t, fmt, true);
    if (d.isValid()) {
      return formatIsoDate(d);
    }
  }
  return null;
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map((h) => normalizeHeaderKey(h));
  for (const key of candidates) {
    const idx = normalized.indexOf(key);
    if (idx >= 0) {
      return idx;
    }
  }
  return -1;
}

/**
 * Parse holiday CSV in the browser. Requires a date column (flexible header). Name column is optional.
 */
export function parseFmbHolidayCsv(content: string): ParseFmbHolidayCsvResult {
  const grid = parseCsvGrid(content);
  if (grid.length < 2) {
    throw new Error("CSV must include a header row and at least one data row");
  }

  const headerRow = grid[0]!;
  const dateCol = findColumnIndex(headerRow, DATE_HEADER_KEYS);
  if (dateCol < 0) {
    throw new Error(
      `No date column found. Use one of these headers: ${DATE_HEADER_KEYS.join(", ")}`
    );
  }

  const nameCol = findColumnIndex(headerRow, NAME_HEADER_KEYS);
  const detectedDateHeader = normalizeHeader(headerRow[dateCol] ?? "date");
  const detectedNameHeader = nameCol >= 0 ? normalizeHeader(headerRow[nameCol] ?? "name") : null;

  const byDate = new Map<string, ParsedFmbHolidayRow>();
  const parseErrors: FmbHolidayCsvParseError[] = [];
  let skippedBlankRows = 0;

  for (let i = 1; i < grid.length; i++) {
    const cells = grid[i]!;
    const rawDate = cells[dateCol] ?? "";
    const holidayDateYmd = parseHolidayDateCell(rawDate);
    const sourceRowNumber = i + 1;
    const rowText = rawDate.trim();
    const namePreview = nameCol >= 0 ? normalizeHeader(cells[nameCol] ?? "").trim() : "";

    if (!holidayDateYmd) {
      if (!rowText && !namePreview) {
        skippedBlankRows += 1;
        continue;
      }
      if (!rowText) {
        parseErrors.push({ rowNumber: sourceRowNumber, message: "Missing holiday date" });
        continue;
      }
      parseErrors.push({
        rowNumber: sourceRowNumber,
        message: `Invalid date "${rowText}"`,
      });
      continue;
    }

    let name: string | null = null;
    if (nameCol >= 0) {
      const rawName = normalizeHeader(cells[nameCol] ?? "");
      name = rawName.length > 0 ? rawName : null;
    }

    byDate.set(holidayDateYmd, {
      holidayDateYmd,
      name,
      sourceRowNumber,
    });
  }

  if (byDate.size === 0 && parseErrors.length === 0) {
    throw new Error("No holiday rows found in CSV");
  }

  return {
    rows: [...byDate.values()].sort((a, b) => a.holidayDateYmd.localeCompare(b.holidayDateYmd)),
    parseErrors,
    skippedBlankRows,
    detectedDateHeader,
    detectedNameHeader,
  };
}
