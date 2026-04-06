import { useEffect, useMemo, useRef } from "react";
import { useInput } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { Box, Alert, Divider } from "@mui/material";
import TemplateSelector from "./TemplateSelector";
import ParameterMapper from "./ParameterMapper";
import BroadcastPreview from "./BroadcastPreview";
import { useTemplateContext } from "@/containers/whatsapp-broadcasts/context";
import { useTemplateValidation } from "./hooks";
import type { TemplateBodyRecord } from "./hooks";
import type { BroadcastParameter } from "./utils";

type TemplateSelectionStepProps = {
  source?: string;
  onValidationChange?: (isValid: boolean, errorMessage: string | null) => void;
};

const TemplateSelectionStep = ({
  source = "_templateStep",
  onValidationChange,
  ...props
}: TemplateSelectionStepProps) => {
  const { field } = useInput({ source, ...props });
  const { control } = useFormContext();

  const templateName = useWatch({ control, name: "templateName" });

  const { data: selectedTemplate, isLoading: isLoadingTemplate } = useTemplateContext();

  const watchedParameters = useWatch({
    control,
    name: "parameters",
    defaultValue: {},
  });

  const csvColumnHeaders = useWatch({
    control,
    name: "csvColumnHeaders",
    defaultValue: [],
  });

  const parametersRef = useRef({ value: {} as Record<string, unknown>, serialized: "" });
  const currentSerialized = JSON.stringify(watchedParameters || {});

  if (parametersRef.current.serialized !== currentSerialized) {
    parametersRef.current = {
      value: (watchedParameters || {}) as Record<string, unknown>,
      serialized: currentSerialized,
    };
  }

  const parameters = parametersRef.current.value;
  const parametersSerialized = parametersRef.current.serialized;

  const { isValid, errorMessage, expectedVariables } = useTemplateValidation(
    templateName,
    selectedTemplate as TemplateBodyRecord | undefined,
    isLoadingTemplate,
    parameters as Record<string, BroadcastParameter> | undefined,
    Array.isArray(csvColumnHeaders) ? csvColumnHeaders : []
  );

  const validationState = useMemo(
    () => ({
      isValid,
      errorMessage,
    }),
    [isValid, errorMessage]
  );

  const lastStateSerializedRef = useRef<string | null>(null);

  const currentStateSerialized = useMemo(
    () =>
      JSON.stringify({
        templateName,
        parameters: parametersRef.current.value,
        isValid: validationState.isValid,
        expectedVariablesCount: expectedVariables?.length || 0,
      }),
    [templateName, parametersSerialized, validationState.isValid, expectedVariables?.length || 0]
  );

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStateSerialized]);

  const prevValidationRef = useRef<{ isValid: boolean | null; errorMessage: string | null }>({
    isValid: null,
    errorMessage: null,
  });
  useEffect(() => {
    if (onValidationChange) {
      if (
        prevValidationRef.current.isValid !== validationState.isValid ||
        prevValidationRef.current.errorMessage !== validationState.errorMessage
      ) {
        prevValidationRef.current = {
          isValid: validationState.isValid,
          errorMessage: validationState.errorMessage,
        };
        onValidationChange(validationState.isValid, validationState.errorMessage);
      }
    }
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

        <TemplateSelector />

        <Divider sx={{ my: 1.5 }} />

        {templateName && <ParameterMapper />}
      </Box>

      <Box sx={{ flex: { md: "0 0 35%" } }}>
        <BroadcastPreview />
      </Box>
    </Box>
  );
};

export default TemplateSelectionStep;
