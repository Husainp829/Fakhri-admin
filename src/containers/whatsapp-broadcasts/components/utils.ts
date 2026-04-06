/* eslint-disable quotes */

export type BroadcastParameter =
  | string
  | {
      type?: string;
      value?: unknown;
      column?: unknown;
      columnSource?: string;
    };

export type ParsedBroadcastCsv = {
  headers: string[];
  rows: Record<string, string>[];
  itsHeader: string | null;
};

export type TemplateParamValidation = {
  isValid: boolean;
  missingParams: number[];
  errors: Record<string, string>;
};

export const extractTemplateVariables = (bodyText: string | undefined | null): number[] => {
  if (!bodyText) return [];
  const variableMatches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
  const variables = variableMatches.map((m) => {
    const num = parseInt(m.replace(/\{\{|\}\}/g, ""), 10);
    return num;
  });
  return [...new Set(variables)].sort((a, b) => a - b);
};

const ITS_HEADER_ALIASES = new Set(["its", "its_id", "itsid", "its_no", "itsno"]);

const normalizeHeaderKey = (h: string) => String(h).replace(/[\s_]/g, "").toLowerCase();

export const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result.map((cell) => cell.replace(/^"|"$/g, "").trim());
};

export const resolveItsColumnHeader = (headers: string[]): string | null => {
  if (!headers || headers.length === 0) return null;
  if (headers.length === 1) return headers[0];
  const found = headers.find((h) => ITS_HEADER_ALIASES.has(normalizeHeaderKey(h)));
  return found || null;
};

export const normalizeItsIdFromCell = (cell: string | undefined | null): string => {
  if (cell === undefined || cell === null) return "";
  const digits = String(cell).replace(/\D/g, "");
  return /^\d{5,}$/.test(digits) ? digits : "";
};

export const parseBroadcastCsv = (text: string): ParsedBroadcastCsv => {
  const lines = String(text)
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== "");

  if (lines.length === 0) {
    return { headers: [], rows: [], itsHeader: null };
  }

  const firstCells = parseCsvLine(lines[0]);
  const singleCellNumeric =
    firstCells.length === 1 && /^\d{5,}$/.test(firstCells[0].replace(/\s/g, ""));

  let headers: string[];
  let dataStart: number;

  if (firstCells.length === 1 && singleCellNumeric) {
    headers = ["ITS"];
    dataStart = 0;
  } else {
    headers = firstCells.map((h) => String(h).trim());
    dataStart = 1;
  }

  const rows: Record<string, string>[] = [];
  for (let i = dataStart; i < lines.length; i += 1) {
    const cells = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] !== undefined ? String(cells[idx]).trim() : "";
    });
    rows.push(row);
  }

  const itsHeader = resolveItsColumnHeader(headers);
  return { headers, rows, itsHeader };
};

export const extractItsIdsFromParsedCsv = (parsed: ParsedBroadcastCsv): string[] => {
  const { rows, itsHeader } = parsed;
  if (!itsHeader || !rows.length) return [];
  const ids = rows.map((r) => normalizeItsIdFromCell(r[itsHeader])).filter((id) => id.length > 0);
  return [...new Set(ids)];
};

export const validateTemplateParameters = (
  templateBodyText: string,
  parameters: Record<string, BroadcastParameter> | undefined | null,
  csvColumnHeaders: string[] = []
): TemplateParamValidation => {
  const expectedVariables = extractTemplateVariables(templateBodyText);

  if (expectedVariables.length === 0) {
    return {
      isValid: true,
      missingParams: [],
      errors: {},
    };
  }

  if (!parameters || typeof parameters !== "object") {
    return {
      isValid: false,
      missingParams: expectedVariables,
      errors: expectedVariables.reduce<Record<string, string>>((acc, varNum) => {
        acc[`parameters.${varNum}`] = `Parameter {{${varNum}}} is required`;
        return acc;
      }, {}),
    };
  }

  const missingParams = expectedVariables.filter((varNum) => {
    const paramKey = String(varNum);
    const param = parameters[paramKey] ?? parameters[varNum];

    if (param && typeof param === "object") {
      if (param.type === "text") {
        const { value } = param;
        return (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "")
        );
      }
      if (param.type === "column") {
        const col =
          param.column === undefined || param.column === null ? "" : String(param.column).trim();
        if (!col) return true;
        const fromCsv = param.columnSource === "csv";
        if (fromCsv) {
          if (!csvColumnHeaders || csvColumnHeaders.length === 0) return true;
          return !csvColumnHeaders.includes(col);
        }
        return false;
      }
      return true;
    }

    if (typeof param === "string") {
      return param.trim() === "";
    }

    return true;
  });

  const errors = missingParams.reduce<Record<string, string>>((acc, varNum) => {
    const paramKey = String(varNum);
    const param = parameters[paramKey] ?? parameters[varNum];

    if (param && typeof param === "object") {
      if (param.type === "text") {
        acc[`parameters.${varNum}.value`] = `Parameter {{${varNum}}} value is required`;
      } else if (param.type === "column") {
        const fromCsv = param.columnSource === "csv";
        const col =
          param.column === undefined || param.column === null ? "" : String(param.column).trim();
        if (fromCsv && (!csvColumnHeaders || csvColumnHeaders.length === 0)) {
          acc[`parameters.${varNum}.column`] =
            `Parameter {{${varNum}}}: upload a CSV with column headers on the recipients step to use CSV columns`;
        } else if (
          fromCsv &&
          col &&
          csvColumnHeaders &&
          csvColumnHeaders.length > 0 &&
          !csvColumnHeaders.includes(col)
        ) {
          acc[`parameters.${varNum}.column`] =
            `Parameter {{${varNum}}}: "${col}" is not a column in the uploaded CSV`;
        } else {
          acc[`parameters.${varNum}.column`] = `Parameter {{${varNum}}} column is required`;
        }
      } else {
        acc[`parameters.${varNum}`] = `Parameter {{${varNum}}} is required`;
      }
    } else {
      acc[`parameters.${varNum}`] = `Parameter {{${varNum}}} is required`;
    }
    return acc;
  }, {});

  return {
    isValid: missingParams.length === 0,
    missingParams,
    errors,
  };
};

export const getMissingParametersMessage = (missingParams: number[]): string => {
  if (!missingParams || missingParams.length === 0) {
    return "";
  }
  return `Please fill all required parameters: ${missingParams
    .map((num) => `{{${num}}}`)
    .join(", ")}`;
};

export const transformParameters = (
  parameters: Record<string, BroadcastParameter> | undefined | null
): Record<
  string,
  { type: "text"; value: string } | { type: "column"; column: string; columnSource?: "csv" }
> => {
  const transformed: Record<
    string,
    { type: "text"; value: string } | { type: "column"; column: string; columnSource?: "csv" }
  > = {};
  if (parameters && typeof parameters === "object") {
    Object.keys(parameters).forEach((key) => {
      const param = parameters[key];

      if (param && typeof param === "object" && param.type) {
        if (param.type === "text") {
          const { value } = param;
          if (value !== undefined && value !== null && value !== "") {
            transformed[key] = {
              type: "text",
              value: String(value).trim(),
            };
          }
        } else if (param.type === "column") {
          const { column, columnSource } = param;
          if (column !== undefined && column !== null && column !== "") {
            const entry: { type: "column"; column: string; columnSource?: "csv" } = {
              type: "column",
              column: String(column).trim(),
            };
            if (columnSource === "csv") {
              entry.columnSource = "csv";
            }
            transformed[key] = entry;
          }
        }
      } else if (param !== undefined && param !== null && param !== "") {
        transformed[key] = {
          type: "text",
          value: String(param).trim(),
        };
      }
    });
  }
  return transformed;
};

export const transformRecipientPhoneNumbers = (data: {
  selectedRecipientPhones?: unknown;
}): string[] | null => {
  if (
    !data.selectedRecipientPhones ||
    !Array.isArray(data.selectedRecipientPhones) ||
    data.selectedRecipientPhones.length === 0
  ) {
    return null;
  }

  const cleaned = data.selectedRecipientPhones.filter((p) => p && String(p).trim().length > 0);

  return cleaned.length > 0 ? cleaned.map(String) : null;
};

export type FilterCriteriaShape = {
  rules?: unknown[];
  groups?: unknown[];
};

export const transformFilterCriteria = (filterCriteria: FilterCriteriaShape | null | undefined) => {
  if (!filterCriteria) {
    return null;
  }

  const hasRules = filterCriteria.rules && filterCriteria.rules.length > 0;
  const hasGroups = filterCriteria.groups && filterCriteria.groups.length > 0;

  if (hasRules || hasGroups) {
    return filterCriteria;
  }

  return null;
};

export type BroadcastFormData = {
  templateName?: string;
  name?: string;
  parameters?: Record<string, BroadcastParameter>;
  filterCriteria?: FilterCriteriaShape;
  selectedRecipientPhones?: string[];
  createdBy?: string;
  recipientItsIds?: string[] | null;
  recipientCsvData?: Record<string, Record<string, string>> | null;
};

export const transformBroadcastData = (data: BroadcastFormData) => {
  const payload: Record<string, unknown> = {
    templateName: data.templateName,
    name: data.name,
    parameters: transformParameters(data.parameters),
    filterCriteria: transformFilterCriteria(data.filterCriteria),
    recipientPhoneNumbers: transformRecipientPhoneNumbers(data),
    createdBy: data.createdBy || "admin",
  };

  if (Array.isArray(data.recipientItsIds) && data.recipientItsIds.length > 0) {
    payload.recipientItsIds = data.recipientItsIds;
  }

  if (
    data.recipientCsvData &&
    typeof data.recipientCsvData === "object" &&
    Object.keys(data.recipientCsvData).length > 0
  ) {
    payload.recipientCsvData = data.recipientCsvData;
  }

  return payload;
};
