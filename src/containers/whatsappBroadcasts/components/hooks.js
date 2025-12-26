import { useMemo } from "react";
import { useGetOne, useDataProvider } from "react-admin";
import { useQuery } from "@tanstack/react-query";
import {
  validateTemplateParameters,
  getMissingParametersMessage,
  extractTemplateVariables,
} from "./utils";

/**
 * Custom hook to fetch a WhatsApp template by name.
 * Uses React Admin's useGetOne with caching support.
 *
 * @param {string} templateName - The template name (used as ID)
 * @returns {Object} - { data, isLoading, error }
 */
export const useTemplate = (templateName) =>
  useGetOne("whatsappTemplates", {
    id: templateName || "",
  });

/**
 * Custom hook to preview recipients based on filter criteria.
 * Uses react-query for caching and state management.
 *
 * @param {Object} options - Query options
 * @param {Object} options.filterCriteria - Filter criteria object
 * @param {number} options.limit - Maximum number of recipients to fetch
 * @param {number} options.offset - Offset for pagination
 * @param {boolean} options.enabled - Whether the query should run
 * @returns {Object} - { data, isLoading, error, refetch }
 */
export const usePreviewRecipients = ({
  filterCriteria,
  limit = 10000,
  offset = 0,
  enabled = false,
}) => {
  const dataProvider = useDataProvider();

  return useQuery({
    queryKey: [
      "whatsappBroadcasts",
      "previewRecipients",
      filterCriteria,
      limit,
      offset,
    ],
    queryFn: async () => {
      if (
        !filterCriteria ||
        (!filterCriteria.rules?.length && !filterCriteria.groups?.length)
      ) {
        throw new Error("Please add at least one filter condition");
      }
      return dataProvider.previewRecipients("whatsappBroadcasts", {
        filterCriteria,
        limit,
        offset,
      });
    },
    enabled: enabled && !!filterCriteria,
    staleTime: 30000, // Cache for 30 seconds
  });
};

/**
 * Custom hook to validate template parameters.
 * Provides validation state and error messages for template parameter validation.
 *
 * @param {string} templateName - The selected template name
 * @param {Object} template - The template object (should have bodyText property)
 * @param {boolean} isLoadingTemplate - Whether the template is currently loading
 * @param {Object} parameters - The parameters object from form (e.g., { "1": "value1", "2": "value2" })
 * @returns {Object} - Validation state with isValid, errorMessage, expectedVariables, and validationErrors
 * @example
 * const { isValid, errorMessage, expectedVariables } = useTemplateValidation(
 *   templateName,
 *   selectedTemplate,
 *   isLoadingTemplate,
 *   parameters
 * );
 */
export const useTemplateValidation = (
  templateName,
  template,
  isLoadingTemplate,
  parameters
) => {
  // Extract expected variables from template body text
  const expectedVariables = useMemo(() => {
    if (!template?.bodyText) return [];
    return extractTemplateVariables(template.bodyText);
  }, [template?.bodyText]);

  // Serialize parameters for memoization (to detect actual content changes)
  const parametersSerialized = useMemo(
    () => JSON.stringify(parameters || {}),
    [parameters]
  );

  // Validate template parameters
  const validationResult = useMemo(() => {
    // Early returns for common cases
    if (!templateName) {
      return {
        isValid: false,
        errorMessage: "Please select a template before proceeding.",
        expectedVariables: [],
        validationErrors: {},
      };
    }

    if (isLoadingTemplate) {
      return {
        isValid: false,
        errorMessage: "Loading template...",
        expectedVariables: [],
        validationErrors: {},
      };
    }

    // Use shared validation utility
    const result = validateTemplateParameters(
      template?.bodyText || "",
      parameters
    );

    return {
      isValid: result.isValid,
      errorMessage: result.isValid
        ? null
        : getMissingParametersMessage(result.missingParams),
      expectedVariables,
      validationErrors: result.errors,
    };
  }, [
    templateName,
    isLoadingTemplate,
    template?.bodyText,
    parametersSerialized,
    expectedVariables,
  ]);

  return validationResult;
};
