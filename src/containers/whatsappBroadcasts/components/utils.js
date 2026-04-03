/**
 * Extract expected variable numbers from template body text.
 * Looks for patterns like {{1}}, {{2}}, etc. and returns sorted unique numbers.
 *
 * @param {string} bodyText - The template body text
 * @returns {number[]} - Array of sorted unique variable numbers
 * @example
 * extractTemplateVariables("Hello {{1}}, your order {{2}} is ready.")
 * // Returns [1, 2]
 */
export const extractTemplateVariables = (bodyText) => {
  if (!bodyText) return [];
  const variableMatches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
  const variables = variableMatches.map((m) => {
    const num = parseInt(m.replace(/\{\{|\}\}/g, ""), 10);
    return num;
  });
  // Remove duplicates and sort
  return [...new Set(variables)].sort((a, b) => a - b);
};

const ITS_HEADER_ALIASES = new Set(["its", "its_id", "itsid", "its_no", "itsno"]);

const normalizeHeaderKey = (h) => String(h).replace(/[\s_]/g, "").toLowerCase();

/**
 * Parse one CSV line with quote support.
 * @param {string} line
 * @returns {string[]}
 */
export const parseCsvLine = (line) => {
  const result = [];
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

/**
 * Find the header cell that holds ITS numbers (multi-column files).
 * @param {string[]} headers
 * @returns {string|null}
 */
export const resolveItsColumnHeader = (headers) => {
  if (!headers || headers.length === 0) return null;
  if (headers.length === 1) return headers[0];
  const found = headers.find((h) => ITS_HEADER_ALIASES.has(normalizeHeaderKey(h)));
  return found || null;
};

/**
 * Normalize an ITS id from a CSV cell (digits only, min length 5).
 * @param {string|undefined|null} cell
 * @returns {string}
 */
export const normalizeItsIdFromCell = (cell) => {
  if (cell === undefined || cell === null) return "";
  const digits = String(cell).replace(/\D/g, "");
  return /^\d{5,}$/.test(digits) ? digits : "";
};

/**
 * Parse CSV text into headers and row objects for broadcast uploads.
 * @param {string} text - Raw file contents
 * @returns {{ headers: string[], rows: Record<string, string>[], itsHeader: string|null }}
 */
export const parseBroadcastCsv = (text) => {
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

  let headers;
  let dataStart;

  if (firstCells.length === 1 && singleCellNumeric) {
    headers = ["ITS"];
    dataStart = 0;
  } else {
    headers = firstCells.map((h) => String(h).trim());
    dataStart = 1;
  }

  const rows = [];
  for (let i = dataStart; i < lines.length; i += 1) {
    const cells = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] !== undefined ? String(cells[idx]).trim() : "";
    });
    rows.push(row);
  }

  const itsHeader = resolveItsColumnHeader(headers);
  return { headers, rows, itsHeader };
};

/**
 * Unique valid ITS ids from parsed CSV rows.
 * @param {{ rows: Record<string, string>[], itsHeader: string|null }} parsed
 * @returns {string[]}
 */
export const extractItsIdsFromParsedCsv = (parsed) => {
  const { rows, itsHeader } = parsed;
  if (!itsHeader || !rows.length) return [];
  const ids = rows.map((r) => normalizeItsIdFromCell(r[itsHeader])).filter((id) => id.length > 0);
  return [...new Set(ids)];
};

/**
 * Validate that all required template parameters have values.
 *
 * @param {string} templateBodyText - The template body text (to extract expected variables)
 * @param {Object} parameters - The parameters object
 *   Old format: { "1": "value1", "2": "value2" }
 *   New format: { "1": { type: "text", value: "..." }, "2": { type: "column", column: "Full_Name" } }
 * @param {string[]} [csvColumnHeaders] - Header names from uploaded CSV (for columnSource "csv")
 * @returns {{ isValid: boolean, missingParams: number[], errors: Object }} - Validation result
 */
export const validateTemplateParameters = (templateBodyText, parameters, csvColumnHeaders = []) => {
  const expectedVariables = extractTemplateVariables(templateBodyText);

  // If no variables expected, validation always passes
  if (expectedVariables.length === 0) {
    return {
      isValid: true,
      missingParams: [],
      errors: {},
    };
  }

  // Validate parameters exist and are objects
  if (!parameters || typeof parameters !== "object") {
    return {
      isValid: false,
      missingParams: expectedVariables,
      errors: expectedVariables.reduce((acc, varNum) => {
        acc[`parameters.${varNum}`] = `Parameter {{${varNum}}} is required`;
        return acc;
      }, {}),
    };
  }

  // Check each expected variable - all must have values
  // Parameters are stored with string keys (e.g., "1", "2")
  const missingParams = expectedVariables.filter((varNum) => {
    const paramKey = String(varNum);
    const param = parameters[paramKey] ?? parameters[varNum];

    // Handle new structure: { type: "text", value: "..." } or { type: "column", column: "Full_Name" }
    if (param && typeof param === "object") {
      if (param.type === "text") {
        // For text type, value must be non-empty
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
      // Invalid structure
      return true;
    }

    // Handle old structure: simple string value (backward compatibility)
    if (typeof param === "string") {
      return param.trim() === "";
    }

    // Missing or invalid
    return (
      param === undefined || param === null || (typeof param === "string" && param.trim() === "")
    );
  });

  const errors = missingParams.reduce((acc, varNum) => {
    const paramKey = String(varNum);
    const param = parameters[paramKey] ?? parameters[varNum];

    // Determine which field to highlight in the error
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

/**
 * Generate error message for missing template parameters.
 *
 * @param {number[]} missingParams - Array of missing parameter numbers
 * @returns {string} - Formatted error message
 * @example
 * getMissingParametersMessage([1, 3])
 * // Returns "Please fill all required parameters: {{1}}, {{3}}"
 */
export const getMissingParametersMessage = (missingParams) => {
  if (!missingParams || missingParams.length === 0) {
    return "";
  }
  return `Please fill all required parameters: ${missingParams
    .map((num) => `{{${num}}}`)
    .join(", ")}`;
};

/**
 * Transform parameters object to clean format for API submission.
 * Handles both old format (simple string values) and new format (objects with type/value/column).
 * Filters out undefined, null, and empty values.
 *
 * @param {Object} parameters - Raw parameters object from form
 *   Old format: { "1": "value1", "2": "value2" }
 *   New format: { "1": { type: "text", value: "..." }, "2": { type: "column", column: "Full_Name" } }
 * @returns {Object} - Cleaned parameters object in new format
 * @example
 * transformParameters({ "1": "value1", "2": "", "3": null })
 * // Returns { "1": { type: "text", value: "value1" } }
 *
 * transformParameters({ "1": { type: "text", value: "value1" }, "2": { type: "column", column: "Full_Name" } })
 * // Returns { "1": { type: "text", value: "value1" }, "2": { type: "column", column: "Full_Name" } }
 */
export const transformParameters = (parameters) => {
  const transformed = {};
  if (parameters && typeof parameters === "object") {
    Object.keys(parameters).forEach((key) => {
      const param = parameters[key];

      // Handle new structure: { type: "text", value: "..." } or { type: "column", column: "Full_Name" }
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
            const entry = {
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
        // Handle old structure: simple string value (backward compatibility)
        // Convert to new format
        transformed[key] = {
          type: "text",
          value: String(param).trim(),
        };
      }
    });
  }
  return transformed;
};

/**
 * Transform recipient phone numbers from filter preview selections to clean array.
 *
 * @param {Object} data - Form data containing recipient phone numbers
 * @param {string[]} data.selectedRecipientPhones - Selected phones from filter preview
 * @returns {string[]|null} - Array of cleaned phone numbers, or null if empty
 */
export const transformRecipientPhoneNumbers = (data) => {
  if (
    !data.selectedRecipientPhones ||
    !Array.isArray(data.selectedRecipientPhones) ||
    data.selectedRecipientPhones.length === 0
  ) {
    return null;
  }

  const cleaned = data.selectedRecipientPhones.filter((p) => p && String(p).trim().length > 0);

  return cleaned.length > 0 ? cleaned : null;
};

/**
 * Transform filter criteria, only including if it has actual rules or groups.
 *
 * @param {Object} filterCriteria - Filter criteria object
 * @param {Array} filterCriteria.rules - Array of filter rules
 * @param {Array} filterCriteria.groups - Array of filter groups
 * @returns {Object|null} - Filter criteria if valid, null otherwise
 */
export const transformFilterCriteria = (filterCriteria) => {
  if (!filterCriteria) {
    return null;
  }

  const hasRules = filterCriteria.rules && filterCriteria.rules.length > 0;
  const hasGroups = filterCriteria.groups && filterCriteria.groups.length > 0;

  // Only include filterCriteria if it has actual rules or groups
  if (hasRules || hasGroups) {
    return filterCriteria;
  }

  return null;
};

/**
 * Transform broadcast form data for API submission.
 * Combines all transformation utilities to create the final payload.
 *
 * @param {Object} data - Raw form data
 * @param {string} data.templateName - Template name
 * @param {string} data.name - Broadcast name
 * @param {Object} data.parameters - Template parameters
 * @param {Object} data.filterCriteria - Filter criteria
 * @param {string[]} data.selectedRecipientPhones - Selected phones from filter preview
 * @param {string} data.createdBy - Creator identifier (optional)
 * @returns {Object} - Transformed data ready for API submission
 */
export const transformBroadcastData = (data) => {
  const payload = {
    templateName: data.templateName,
    name: data.name,
    parameters: transformParameters(data.parameters),
    filterCriteria: transformFilterCriteria(data.filterCriteria),
    recipientPhoneNumbers: transformRecipientPhoneNumbers(data),
    createdBy: data.createdBy || "admin", // TODO: Get from auth context
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
