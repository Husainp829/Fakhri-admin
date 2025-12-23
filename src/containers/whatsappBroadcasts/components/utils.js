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

/**
 * Validate that all required template parameters have values.
 *
 * @param {string} templateBodyText - The template body text (to extract expected variables)
 * @param {Object} parameters - The parameters object
 *   Old format: { "1": "value1", "2": "value2" }
 *   New format: { "1": { type: "text", value: "..." }, "2": { type: "column", column: "Full_Name" } }
 * @returns {{ isValid: boolean, missingParams: number[], errors: Object }} - Validation result
 */
export const validateTemplateParameters = (templateBodyText, parameters) => {
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
        // For column type, column must be selected
        const { column } = param;
        return (
          column === undefined ||
          column === null ||
          (typeof column === "string" && column.trim() === "")
        );
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
      param === undefined ||
      param === null ||
      (typeof param === "string" && param.trim() === "")
    );
  });

  const errors = missingParams.reduce((acc, varNum) => {
    const paramKey = String(varNum);
    const param = parameters[paramKey] ?? parameters[varNum];

    // Determine which field to highlight in the error
    if (param && typeof param === "object") {
      if (param.type === "text") {
        acc[
          `parameters.${varNum}.value`
        ] = `Parameter {{${varNum}}} value is required`;
      } else if (param.type === "column") {
        acc[
          `parameters.${varNum}.column`
        ] = `Parameter {{${varNum}}} column is required`;
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
          const { column } = param;
          if (column !== undefined && column !== null && column !== "") {
            transformed[key] = {
              type: "column",
              column: String(column).trim(),
            };
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

  const cleaned = data.selectedRecipientPhones.filter(
    (p) => p && String(p).trim().length > 0
  );

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
export const transformBroadcastData = (data) => ({
  templateName: data.templateName,
  name: data.name,
  parameters: transformParameters(data.parameters),
  filterCriteria: transformFilterCriteria(data.filterCriteria),
  recipientPhoneNumbers: transformRecipientPhoneNumbers(data),
  createdBy: data.createdBy || "admin", // TODO: Get from auth context
});
