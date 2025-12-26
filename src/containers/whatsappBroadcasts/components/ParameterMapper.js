import React from "react";
import { TextInput, SelectInput, required } from "react-admin";
import { useWatch, useFormContext } from "react-hook-form";
import {
  Box,
  Typography,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@mui/material";
import { useTemplateContext } from "../context";
import { extractTemplateVariables } from "./utils";
import { ITS_COLUMNS } from "./AdvancedFilterBuilder/constants";

/**
 * ParameterMapper Component
 *
 * React Admin field component that dynamically renders parameter inputs
 * based on the selected template. Watches templateName from form context.
 * Supports two modes for each parameter:
 * - Free Text: Static value applied to all recipients
 * - Column: Select a column from ITS_COLUMNS for per-recipient mapping
 */
const ParameterMapper = () => {
  // Watch templateName and parameters from form context
  const templateName = useWatch({ name: "templateName" });
  const parameters = useWatch({ name: "parameters" }) || {};
  const { setValue, watch } = useFormContext();

  // Use template from context (fetched once at parent level)
  const { data: selectedTemplate, isLoading, error } = useTemplateContext();

  // Extract variables from body text using shared utility
  // All hooks must be called before any early returns
  const variableNumbers = React.useMemo(() => {
    if (!selectedTemplate?.bodyText) return [];
    return extractTemplateVariables(selectedTemplate.bodyText || "");
  }, [selectedTemplate?.bodyText]);

  const variables = React.useMemo(
    () =>
      variableNumbers.map((num) => ({
        number: num,
        placeholder: `{{${num}}}`,
      })),
    [variableNumbers]
  );

  // Prepare ITS_COLUMNS choices for SelectInput
  const itsColumnChoices = React.useMemo(
    () =>
      ITS_COLUMNS.map((col) => ({
        id: col.id,
        name: col.label,
      })),
    []
  );

  // Initialize parameters structure for each variable if needed
  React.useEffect(() => {
    if (variables.length === 0) return;

    const currentParams = watch("parameters") || {};
    let needsUpdate = false;
    const updatedParams = { ...currentParams };

    variables.forEach((variable) => {
      const paramKey = String(variable.number);
      const existingParam = currentParams[paramKey];

      // Initialize if missing or if it's in old format (simple string)
      if (
        !existingParam ||
        typeof existingParam !== "object" ||
        !existingParam.type
      ) {
        updatedParams[paramKey] = { type: "text", value: "" };
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      setValue("parameters", updatedParams, { shouldValidate: false });
    }
  }, [variables, setValue, watch]);

  // Early returns after all hooks
  if (!templateName) {
    return null;
  }

  if (isLoading) {
    return <Typography>Loading template...</Typography>;
  }

  if (error || !selectedTemplate) {
    return (
      <Typography color={error ? "error" : "text.secondary"}>
        {error
          ? `Error loading template: ${error.message}`
          : `Template not found${templateName ? `: ${templateName}` : ""}`}
      </Typography>
    );
  }

  if (variables.length === 0) {
    return (
      <Alert severity="info">
        This template has no variables. No parameters needed.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
        Template Parameters
      </Typography>
      <Table size="small" sx={{ "& .MuiTableCell-root": { py: 1 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "80px", fontWeight: 500 }}>
              Parameter
            </TableCell>
            <TableCell sx={{ width: "180px", fontWeight: 500 }}>Mode</TableCell>
            <TableCell sx={{ fontWeight: 500 }}>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {variables.map((variable) => {
            const paramKey = String(variable.number);
            const currentParam = parameters[paramKey] || {};
            const paramType = currentParam.type || "text";

            const handleModeChange = (event) => {
              const newType = event.target.value;
              const currentParams = watch("parameters") || {};
              const existingParam = currentParams[paramKey] || {};

              // Preserve existing value/column when switching modes
              const updatedParam = {
                type: newType,
                value: newType === "text" ? existingParam.value || "" : "",
                column: newType === "column" ? existingParam.column || "" : "",
              };

              setValue(
                "parameters",
                {
                  ...currentParams,
                  [paramKey]: updatedParam,
                },
                { shouldValidate: true }
              );
            };

            return (
              <TableRow key={variable.number}>
                <TableCell sx={{ fontWeight: 500, width: "80px" }}>
                  {variable.placeholder}
                </TableCell>
                <TableCell sx={{ width: "250px" }}>
                  <RadioGroup
                    row
                    value={paramType}
                    onChange={handleModeChange}
                    sx={{ m: 0 }}
                  >
                    <FormControlLabel
                      value="text"
                      control={<Radio size="small" />}
                      label="Text"
                      sx={{ mr: 1.5 }}
                    />
                    <FormControlLabel
                      value="column"
                      control={<Radio size="small" />}
                      label="Column"
                    />
                  </RadioGroup>
                </TableCell>
                <TableCell sx={{ width: "300px" }}>
                  <Box>
                    {paramType === "text" ? (
                      <TextInput
                        source={`parameters.${paramKey}.value`}
                        validate={required()}
                        fullWidth
                        size="small"
                      />
                    ) : (
                      <SelectInput
                        source={`parameters.${paramKey}.column`}
                        choices={itsColumnChoices}
                        validate={required()}
                        fullWidth
                        size="small"
                      />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ParameterMapper;
