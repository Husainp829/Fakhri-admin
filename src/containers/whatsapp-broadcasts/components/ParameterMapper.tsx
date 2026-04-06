import { useMemo, useEffect, type ChangeEvent } from "react";
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
  Stack,
} from "@mui/material";
import { useTemplateContext } from "@/containers/whatsapp-broadcasts/context";
import { extractTemplateVariables, type BroadcastParameter } from "./utils";
import { ITS_COLUMNS } from "./advanced-filter-builder/constants";

type ParamVariable = { number: number; placeholder: string };

const ParameterMapper = () => {
  const templateName = useWatch({ name: "templateName" });
  const parameters =
    (useWatch({ name: "parameters" }) as Record<string, BroadcastParameter> | undefined) || {};
  const csvColumnHeaders = (useWatch({ name: "csvColumnHeaders" }) as string[] | undefined) || [];
  const { setValue, watch } = useFormContext();

  const { data: selectedTemplate, isLoading, error } = useTemplateContext();

  const variableNumbers = useMemo(() => {
    if (!selectedTemplate?.bodyText) return [];
    return extractTemplateVariables(String(selectedTemplate.bodyText));
  }, [selectedTemplate?.bodyText]);

  const variables = useMemo(
    (): ParamVariable[] =>
      variableNumbers.map((num) => ({
        number: num,
        placeholder: `{{${num}}}`,
      })),
    [variableNumbers]
  );

  const itsColumnChoices = useMemo(
    () =>
      ITS_COLUMNS.map((col) => ({
        id: col.id,
        name: col.label,
      })),
    []
  );

  const csvColumnChoices = useMemo(
    () =>
      (Array.isArray(csvColumnHeaders) ? csvColumnHeaders : []).map((h) => ({
        id: h,
        name: h,
      })),
    [csvColumnHeaders]
  );

  useEffect(() => {
    if (variables.length === 0) return;

    const currentParams =
      (watch("parameters") as Record<string, BroadcastParameter> | undefined) || {};
    let needsUpdate = false;
    const updatedParams = { ...currentParams };

    variables.forEach((variable) => {
      const paramKey = String(variable.number);
      const existingParam = currentParams[paramKey];

      if (!existingParam || typeof existingParam !== "object" || !existingParam.type) {
        updatedParams[paramKey] = { type: "text", value: "" };
        needsUpdate = true;
      } else if (
        existingParam.type === "column" &&
        (existingParam as { columnSource?: string }).columnSource === undefined
      ) {
        updatedParams[paramKey] = { ...existingParam, columnSource: "its" };
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      setValue("parameters", updatedParams, { shouldValidate: false });
    }
  }, [variables, setValue, watch]);

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
          ? `Error loading template: ${(error as Error).message}`
          : `Template not found${templateName ? `: ${templateName}` : ""}`}
      </Typography>
    );
  }

  if (variables.length === 0) {
    return <Alert severity="info">This template has no variables. No parameters needed.</Alert>;
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
        Template Parameters
      </Typography>
      <Table size="small" sx={{ "& .MuiTableCell-root": { py: 1 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "80px", fontWeight: 500 }}>Parameter</TableCell>
            <TableCell sx={{ width: "180px", fontWeight: 500 }}>Mode</TableCell>
            <TableCell sx={{ fontWeight: 500 }}>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {variables.map((variable) => {
            const paramKey = String(variable.number);
            const currentParam = (parameters[paramKey] as BroadcastParameter | undefined) || {};
            const paramType =
              typeof currentParam === "object" && currentParam && "type" in currentParam
                ? currentParam.type
                : "text";

            const columnSource =
              typeof currentParam === "object" &&
              currentParam &&
              "columnSource" in currentParam &&
              currentParam.columnSource === "csv"
                ? "csv"
                : "its";

            const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
              const newType = event.target.value;
              const currentParams =
                (watch("parameters") as Record<string, BroadcastParameter> | undefined) || {};
              const existingParam = (currentParams[paramKey] as Record<string, unknown>) || {};

              const updatedParam =
                newType === "text"
                  ? {
                      type: "text" as const,
                      value: String(existingParam.value ?? ""),
                    }
                  : {
                      type: "column" as const,
                      column: String(existingParam.column ?? ""),
                      columnSource:
                        existingParam.columnSource === "csv" ? ("csv" as const) : ("its" as const),
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

            const handleColumnSourceChange = (event: ChangeEvent<HTMLInputElement>) => {
              const next = event.target.value;
              const currentParams =
                (watch("parameters") as Record<string, BroadcastParameter> | undefined) || {};
              const existingParam = (currentParams[paramKey] as Record<string, unknown>) || {};
              setValue(
                "parameters",
                {
                  ...currentParams,
                  [paramKey]: {
                    ...existingParam,
                    type: "column",
                    columnSource: next,
                    column: "",
                  },
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
                  <RadioGroup row value={paramType} onChange={handleModeChange} sx={{ m: 0 }}>
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
                <TableCell sx={{ minWidth: 280 }}>
                  <Box>
                    {paramType === "text" ? (
                      <TextInput
                        source={`parameters.${paramKey}.value`}
                        validate={required()}
                        fullWidth
                        size="small"
                      />
                    ) : (
                      <Stack spacing={1}>
                        <RadioGroup
                          row
                          value={columnSource}
                          onChange={handleColumnSourceChange}
                          sx={{ m: 0 }}
                        >
                          <FormControlLabel
                            value="its"
                            control={<Radio size="small" />}
                            label="ITS data"
                            sx={{ mr: 1 }}
                          />
                          <FormControlLabel
                            value="csv"
                            control={<Radio size="small" />}
                            label="CSV file"
                            disabled={csvColumnChoices.length === 0}
                          />
                        </RadioGroup>
                        {columnSource === "csv" && csvColumnChoices.length === 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Upload a CSV with column headers on the recipients step to map CSV
                            columns.
                          </Typography>
                        )}
                        <SelectInput
                          source={`parameters.${paramKey}.column`}
                          choices={columnSource === "csv" ? csvColumnChoices : itsColumnChoices}
                          validate={required()}
                          fullWidth
                          size="small"
                        />
                      </Stack>
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
