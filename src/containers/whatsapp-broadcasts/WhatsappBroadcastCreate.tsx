import { useState, useCallback, type ComponentProps } from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  useNotify,
  useRedirect,
  SaveButton,
  Toolbar,
} from "react-admin";
import { Box, Stepper, Step, StepLabel, StepContent, Button, Alert } from "@mui/material";
import { RecipientSelectionStep, TemplateSelectionStep, SummaryStep } from "./components";
import { TemplateProvider, RecipientSelectionProvider } from "./context";
import {
  transformBroadcastData,
  type BroadcastFormData,
  type BroadcastParameter,
} from "./components/utils";

type FormValues = BroadcastFormData & {
  recipientsPreviewed?: boolean;
  csvColumnHeaders?: string[];
};

const validateForm = (values: FormValues): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!values.recipientsPreviewed) {
    errors.recipientsPreviewed =
      "Please preview recipients before saving. Click 'Preview Recipients' for filter-based selection.";
  }

  if (values.templateName && values.parameters) {
    const parameters = values.parameters || {};
    const paramKeys = Object.keys(parameters).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    const emptyParams = paramKeys.filter((key) => {
      const param = parameters[key] as BroadcastParameter;

      if (param && typeof param === "object" && param.type) {
        if (param.type === "text") {
          const { value } = param;
          return (
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "")
          );
        }
        if (param.type === "column") {
          const { column, columnSource } = param;
          const col = column === undefined || column === null ? "" : String(column).trim();
          if (!col) return true;
          if (columnSource === "csv") {
            const headers = values.csvColumnHeaders || [];
            if (!Array.isArray(headers) || headers.length === 0) return true;
            return !headers.includes(col);
          }
          return false;
        }
        return true;
      }

      return !param || param === null || (typeof param === "string" && param.trim() === "");
    });

    if (emptyParams.length > 0) {
      emptyParams.forEach((key) => {
        const param = parameters[key] as BroadcastParameter;
        if (param && typeof param === "object" && param.type) {
          if (param.type === "text") {
            errors[`parameters.${key}.value`] = `Parameter {{${key}}} value is required`;
          } else if (param.type === "column") {
            const fromCsv = param.columnSource === "csv";
            const col =
              param.column === undefined || param.column === null
                ? ""
                : String(param.column).trim();
            const headers = values.csvColumnHeaders || [];
            if (fromCsv && (!Array.isArray(headers) || headers.length === 0)) {
              errors[`parameters.${key}.column`] =
                `Parameter {{${key}}}: upload a CSV with column headers to use CSV columns`;
            } else if (
              fromCsv &&
              col &&
              Array.isArray(headers) &&
              headers.length > 0 &&
              !headers.includes(col)
            ) {
              errors[`parameters.${key}.column`] =
                `Parameter {{${key}}}: "${col}" is not a column in the uploaded CSV`;
            } else {
              errors[`parameters.${key}.column`] = `Parameter {{${key}}} column is required`;
            }
          } else {
            errors[`parameters.${key}`] = `Parameter {{${key}}} is required`;
          }
        } else {
          errors[`parameters.${key}`] = `Parameter {{${key}}} is required`;
        }
      });
    }
  }

  return errors;
};

export default function WhatsappBroadcastCreate() {
  const notify = useNotify();
  const redirect = useRedirect();
  const [activeStep, setActiveStep] = useState(0);
  const [stepValidations, setStepValidations] = useState({
    step0: false,
    step1: false,
  });
  const [stepErrors, setStepErrors] = useState<{
    step0: string | null;
    step1: string | null;
  }>({
    step0: null,
    step1: null,
  });

  const transform = useCallback((data: FormValues) => transformBroadcastData(data), []);

  const onSuccess = useCallback(
    (data: { id: string | number }) => {
      notify("Broadcast created successfully. Messages are being sent.", {
        type: "success",
      });
      redirect("show", "whatsappBroadcasts", data.id);
    },
    [notify, redirect]
  );

  const handleStepValidationChange = useCallback(
    (stepIndex: number, isValid: boolean, errorMessage: string | null = null) => {
      setStepValidations((prev) => ({
        ...prev,
        [`step${stepIndex}`]: isValid,
      }));
      setStepErrors((prev) => ({
        ...prev,
        [`step${stepIndex}`]: errorMessage,
      }));
    },
    []
  );

  const handleNext = useCallback(() => {
    const currentStepKey = `step${activeStep}` as "step0" | "step1";
    const isCurrentStepValid = stepValidations[currentStepKey];

    if (!isCurrentStepValid) {
      const errorMessage = stepErrors[currentStepKey];
      if (errorMessage) {
        notify(errorMessage, { type: "warning" });
      } else if (activeStep === 0) {
        notify(
          "Please preview recipients before proceeding. Click 'Preview Recipients' for filter-based selection.",
          { type: "warning" }
        );
      } else if (activeStep === 1) {
        notify("Please select a template and fill all required parameters before proceeding.", {
          type: "warning",
        });
      }
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setStepErrors((prev) => ({
      ...prev,
      [currentStepKey]: null,
    }));
  }, [activeStep, stepValidations, stepErrors, notify]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  const handleStep0ValidationChange = useCallback(
    (isValid: boolean, errorMessage: string | null) =>
      handleStepValidationChange(0, isValid, errorMessage),
    [handleStepValidationChange]
  );

  const CustomToolbar = (props: ComponentProps<typeof Toolbar>) => {
    if (activeStep !== 2) {
      return null;
    }
    return (
      <Toolbar {...props}>
        <SaveButton />
      </Toolbar>
    );
  };

  return (
    <Create transform={transform} mutationOptions={{ onSuccess }} title="Create WhatsApp Broadcast">
      <SimpleForm validate={validateForm} toolbar={<CustomToolbar />}>
        <TemplateProvider>
          <RecipientSelectionProvider>
            <Box sx={{ mb: 3 }}>
              <TextInput
                source="name"
                label="Broadcast Name"
                validate={required()}
                helperText="A descriptive name for this broadcast"
              />
            </Box>

            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Select Recipients</StepLabel>
                <StepContent>
                  <RecipientSelectionStep onValidationChange={handleStep0ValidationChange} />
                  {stepErrors.step0 && (
                    <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
                      {stepErrors.step0}
                    </Alert>
                  )}
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!stepValidations.step0}
                      sx={{ mr: 1 }}
                    >
                      Next
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Template & Parameters</StepLabel>
                <StepContent>
                  <TemplateSelectionStep
                    onValidationChange={(isValid, errorMessage) =>
                      handleStepValidationChange(1, isValid, errorMessage)
                    }
                  />
                  {stepErrors.step1 && (
                    <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
                      {stepErrors.step1}
                    </Alert>
                  )}
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!stepValidations.step1}
                      sx={{ mr: 1 }}
                    >
                      Next
                    </Button>
                    <Button onClick={handleBack}>Back</Button>
                  </Box>
                </StepContent>
              </Step>

              <Step>
                <StepLabel>Summary & Confirmation</StepLabel>
                <StepContent>
                  <SummaryStep />
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Review all selections above. Click the Save button in the toolbar to create
                      the broadcast.
                    </Alert>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </RecipientSelectionProvider>
        </TemplateProvider>
      </SimpleForm>
    </Create>
  );
}
