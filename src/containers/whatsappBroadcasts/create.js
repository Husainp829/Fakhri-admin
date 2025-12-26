import React, { useState, useCallback } from "react";
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
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Alert,
} from "@mui/material";
import {
  RecipientSelectionStep,
  TemplateSelectionStep,
  SummaryStep,
} from "./components";
import { TemplateProvider, RecipientSelectionProvider } from "./context";
import { transformBroadcastData } from "./components/utils";

// Custom form-level validator
const validateForm = (values) => {
  const errors = {};

  // Check if recipients are previewed
  if (!values.recipientsPreviewed) {
    errors.recipientsPreviewed =
      "Please preview recipients before saving. Click 'Preview Recipients' for filter-based selection.";
  }

  // Basic parameter validation: if parameters exist, ensure they're not empty
  // Full validation with template body text happens in TemplateSelectionStep component
  // Handles both old format (simple string values) and new format (objects with type/value/column)
  if (values.templateName && values.parameters) {
    const parameters = values.parameters || {};
    const paramKeys = Object.keys(parameters).sort(
      (a, b) => parseInt(a, 10) - parseInt(b, 10)
    );

    // Check if any parameter is empty
    const emptyParams = paramKeys.filter((key) => {
      const param = parameters[key];

      // Handle new structure: { type: "text", value: "..." } or { type: "column", column: "Full_Name" }
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
          const { column } = param;
          return (
            column === undefined ||
            column === null ||
            (typeof column === "string" && column.trim() === "")
          );
        }
        return true; // Invalid structure
      }

      // Handle old structure: simple string value (backward compatibility)
      return (
        !param ||
        param === null ||
        (typeof param === "string" && param.trim() === "")
      );
    });

    if (emptyParams.length > 0) {
      // Add error for each empty parameter
      emptyParams.forEach((key) => {
        const param = parameters[key];
        if (param && typeof param === "object" && param.type) {
          if (param.type === "text") {
            errors[
              `parameters.${key}.value`
            ] = `Parameter {{${key}}} value is required`;
          } else if (param.type === "column") {
            errors[
              `parameters.${key}.column`
            ] = `Parameter {{${key}}} column is required`;
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

export default () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [activeStep, setActiveStep] = useState(0);
  const [stepValidations, setStepValidations] = useState({
    step0: false, // Recipient selection step
    step1: false, // Template selection step
  });
  const [stepErrors, setStepErrors] = useState({
    step0: null, // Error message for step 0
    step1: null, // Error message for step 1
  });

  const transform = useCallback(
    (data) =>
      // Use shared transformation utility
      transformBroadcastData(data),
    []
  );

  const onSuccess = useCallback(
    (data) => {
      notify("Broadcast created successfully. Messages are being sent.", {
        type: "success",
      });
      redirect("show", "whatsappBroadcasts", data.id);
    },
    [notify, redirect]
  );

  // Handle step validation changes
  const handleStepValidationChange = useCallback(
    (stepIndex, isValid, errorMessage = null) => {
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

  // Navigation handlers with validation checks
  const handleNext = useCallback(() => {
    // Get the current step's validation state
    const currentStepKey = `step${activeStep}`;
    const isCurrentStepValid = stepValidations[currentStepKey];

    // Block navigation if current step is invalid
    if (!isCurrentStepValid) {
      // Show error message for the current step
      const errorMessage = stepErrors[currentStepKey];
      if (errorMessage) {
        notify(errorMessage, { type: "warning" });
      } else if (activeStep === 0) {
        // Default error message for step 0 (Recipient selection)
        notify(
          "Please preview recipients before proceeding. Click 'Preview Recipients' for filter-based selection.",
          { type: "warning" }
        );
      } else if (activeStep === 1) {
        // Default error message for step 1 (Template selection)
        notify(
          "Please select a template and fill all required parameters before proceeding.",
          { type: "warning" }
        );
      }
      return; // Block navigation
    }

    // Only proceed if validation passes
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    // Clear error for this step when moving forward
    setStepErrors((prev) => ({
      ...prev,
      [currentStepKey]: null,
    }));
  }, [activeStep, stepValidations, stepErrors, notify]);

  const handleBack = useCallback(() => {
    // Back navigation doesn't require validation
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, []);

  // Memoize validation change callbacks for each step to prevent infinite loops
  const handleStep0ValidationChange = useCallback(
    (isValid, errorMessage) =>
      handleStepValidationChange(0, isValid, errorMessage),
    [handleStepValidationChange]
  );

  // Custom toolbar that only shows Save button on final step
  const CustomToolbar = (props) => {
    if (activeStep !== 2) {
      return null; // Don't show toolbar on steps 0 and 1
    }
    return (
      <Toolbar {...props}>
        <SaveButton />
      </Toolbar>
    );
  };

  return (
    <Create
      transform={transform}
      mutationOptions={{ onSuccess }}
      title="Create WhatsApp Broadcast"
    >
      <SimpleForm validate={validateForm} toolbar={<CustomToolbar />}>
        {/* Template Provider to share template data across all steps */}
        <TemplateProvider>
          {/* Recipient Selection Provider to manage recipient selection state */}
          <RecipientSelectionProvider>
            {/* Broadcast Name at the top */}
            <Box sx={{ mb: 3 }}>
              <TextInput
                source="name"
                label="Broadcast Name"
                validate={required()}
                helperText="A descriptive name for this broadcast"
              />
            </Box>

            {/* Stepper with 3 steps */}
            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Step 1: Select Recipients */}
              <Step>
                <StepLabel>Select Recipients</StepLabel>
                <StepContent>
                  <RecipientSelectionStep
                    onValidationChange={handleStep0ValidationChange}
                  />
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

              {/* Step 2: Template & Parameters */}
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

              {/* Step 3: Summary */}
              <Step>
                <StepLabel>Summary & Confirmation</StepLabel>
                <StepContent>
                  <SummaryStep />
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Button onClick={handleBack}>Back</Button>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Review all selections above. Click the Save button in the
                      toolbar to create the broadcast.
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
};
