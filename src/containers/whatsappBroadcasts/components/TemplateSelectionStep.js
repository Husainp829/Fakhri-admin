import React from "react";
import { useInput } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { Box, Alert, Divider } from "@mui/material";
import TemplateSelector from "./TemplateSelector";
import ParameterMapper from "./ParameterMapper";
import BroadcastPreview from "./BroadcastPreview";
import { useTemplateContext } from "../context";
import { useTemplateValidation } from "./hooks";

/**
 * TemplateSelectionStep Component
 *
 * Combines TemplateSelector, ParameterMapper, and BroadcastPreview for use in a Material-UI Stepper.
 * Integrates with React Admin form using useInput hook.
 * Validates template selection and all parameters.
 *
 * @param {Object} props - Component props
 * @param {string} props.source - Form field source (default: '_templateStep')
 * @param {Function} props.onValidationChange - Callback when validation state changes
 */
const TemplateSelectionStep = ({
  source = "_templateStep",
  onValidationChange,
  ...props
}) => {
  // Use useInput to integrate with React Admin form
  const { field } = useInput({ source, ...props });
  const { control } = useFormContext();

  // Watch form values for template using useWatch for proper subscriptions
  const templateName = useWatch({ control, name: "templateName" });

  // Use template from context (fetched once at parent level)
  const { data: selectedTemplate, isLoading: isLoadingTemplate } =
    useTemplateContext();

  // Watch parameters with useWatch - it will trigger re-renders when parameters change
  // We serialize immediately and compare by content to prevent infinite loops
  const watchedParameters = useWatch({
    control,
    name: "parameters",
    defaultValue: {},
  });

  // Track parameters using ref with content-based comparison
  // Only update when the actual content changes, not just the object reference
  const parametersRef = React.useRef({ value: {}, serialized: "" });
  const currentSerialized = JSON.stringify(watchedParameters || {});

  // Only update ref when content actually changes (prevents unnecessary recalculations)
  if (parametersRef.current.serialized !== currentSerialized) {
    parametersRef.current = {
      value: watchedParameters || {},
      serialized: currentSerialized,
    };
  }

  const parameters = parametersRef.current.value;
  const parametersSerialized = parametersRef.current.serialized;

  // Use shared validation hook
  const { isValid, errorMessage, expectedVariables } = useTemplateValidation(
    templateName,
    selectedTemplate,
    isLoadingTemplate,
    parameters
  );

  // Create validation state object for compatibility
  const validationState = React.useMemo(
    () => ({
      isValid,
      errorMessage,
    }),
    [isValid, errorMessage]
  );

  // Store step completion status in form context
  // Use ref to track the last serialized state to prevent infinite loops
  const lastStateSerializedRef = React.useRef(null);

  // Serialize the state for comparison using stable values from refs
  // This memo only recalculates when actual dependencies change
  const currentStateSerialized = React.useMemo(
    () =>
      JSON.stringify({
        templateName,
        parameters: parametersRef.current.value,
        isValid: validationState.isValid,
        expectedVariablesCount: expectedVariables?.length || 0,
      }),
    [
      templateName,
      parametersSerialized,
      validationState.isValid,
      expectedVariables?.length || 0,
    ]
  );

  React.useEffect(() => {
    // Only update if the serialized state is different from what we last set
    if (lastStateSerializedRef.current !== currentStateSerialized) {
      lastStateSerializedRef.current = currentStateSerialized;

      const stateToStore = {
        templateName,
        parameters: parametersRef.current.value,
        isValid: validationState.isValid,
        expectedVariablesCount: expectedVariables?.length || 0,
      };

      field.onChange(stateToStore);
    }
    // field.onChange is stable from useInput, so we don't need it in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStateSerialized]);

  // Expose validation state to parent stepper
  // Use ref to track previous values to prevent unnecessary calls
  const prevValidationRef = React.useRef({ isValid: null, errorMessage: null });
  React.useEffect(() => {
    if (onValidationChange) {
      // Only call if validation state actually changed
      if (
        prevValidationRef.current.isValid !== validationState.isValid ||
        prevValidationRef.current.errorMessage !== validationState.errorMessage
      ) {
        prevValidationRef.current = {
          isValid: validationState.isValid,
          errorMessage: validationState.errorMessage,
        };
        onValidationChange(
          validationState.isValid,
          validationState.errorMessage
        );
      }
    }
    // Don't include onValidationChange in deps - it's unstable from parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationState.isValid, validationState.errorMessage]);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <Box sx={{ flex: { md: "0 0 60%" } }}>
        {templateName &&
          !isLoadingTemplate &&
          expectedVariables &&
          expectedVariables.length > 0 &&
          validationState.isValid && (
            <Alert severity="success" sx={{ mb: 2 }}>
              All required parameters are filled.
            </Alert>
          )}

        {/* Template Selector */}
        <TemplateSelector />

        <Divider sx={{ my: 1.5 }} />

        {/* Parameter Mapper */}
        {templateName && <ParameterMapper />}
      </Box>

      {/* Preview Section */}
      <Box sx={{ flex: { md: "0 0 35%" } }}>
        <BroadcastPreview />
      </Box>
    </Box>
  );
};

export default TemplateSelectionStep;
