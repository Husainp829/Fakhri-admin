import React, { useMemo } from "react";
import { useWatch, useFormContext } from "react-hook-form";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useTemplateContext, useRecipientSelection } from "../context";
import BroadcastPreview from "./BroadcastPreview";

// Table header cells - constant to avoid recreation
const TABLE_HEAD_CELLS = [
  { label: "#", key: "index" },
  { label: "Phone Number", key: "phone" },
  { label: "ITS ID", key: "itsId" },
  { label: "Full Name", key: "fullName" },
];

/**
 * SummaryStep Component
 *
 * Read-only summary component that displays all broadcast selections
 * using useWatch to access form values.
 */
const SummaryStep = () => {
  const { control } = useFormContext();

  // Watch all form values we need - memoized to prevent unnecessary re-renders
  const name = useWatch({ control, name: "name" });
  const templateName = useWatch({ control, name: "templateName" });
  const parameters = useWatch({
    control,
    name: "parameters",
    defaultValue: {},
  });
  const filterCriteria = useWatch({ control, name: "filterCriteria" });

  const formData = useMemo(
    () => ({
      name,
      templateName,
      parameters,
      filterCriteria,
    }),
    [name, templateName, parameters, filterCriteria]
  );

  return <SummaryContent formData={formData} />;
};

/**
 * SummaryContent Component
 *
 * Internal component that renders the summary based on form data.
 */
const SummaryContent = ({ formData }) => {
  const templateName = formData?.templateName;
  const parameters = formData?.parameters || {};
  const filterCriteria = formData?.filterCriteria;

  // Get recipient data from context (cached and memoized)
  const { recipientCount, recipientDetails, isLoadingDetails } =
    useRecipientSelection();

  // Use template from context (fetched once at parent level)
  const { data: selectedTemplate, isLoading: templateLoading } =
    useTemplateContext();

  // Memoize filter criteria check and recipient source
  const { hasFilterCriteria, recipientSource, filterStats } = useMemo(() => {
    const hasRules = filterCriteria?.rules && filterCriteria.rules.length > 0;
    const hasGroups =
      filterCriteria?.groups && filterCriteria.groups.length > 0;
    const hasFilter = hasRules || hasGroups;

    return {
      hasFilterCriteria: hasFilter,
      recipientSource: hasFilter ? "Filter" : "None",
      filterStats: hasFilter
        ? {
            rulesCount: filterCriteria.rules?.length || 0,
            groupsCount: filterCriteria.groups?.length || 0,
          }
        : null,
    };
  }, [filterCriteria]);

  // Memoize parameter keys calculation
  // Handles both new format ({ type: "text", value: "..." } or { type: "column", column: "..." })
  // and old format (simple string values) for backward compatibility
  const paramKeys = useMemo(
    () =>
      Object.keys(parameters)
        .filter((key) => {
          const param = parameters[key];
          if (!param) return false;

          // Handle new structure: { type: "text", value: "..." } or { type: "column", column: "..." }
          if (param && typeof param === "object" && param.type) {
            if (param.type === "text") {
              return param.value && String(param.value).trim() !== "";
            }
            if (param.type === "column") {
              return param.column && String(param.column).trim() !== "";
            }
            return false; // Invalid structure
          }

          // Handle old structure: simple string value (backward compatibility)
          return String(param).trim() !== "";
        })
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10)),
    [parameters]
  );

  // Memoize template preview data
  const previewData = useMemo(() => {
    if (!selectedTemplate) return null;

    const data = {
      ...selectedTemplate,
      components: selectedTemplate.components || [],
    };

    // Replace variables with form parameters
    // Handle both new format (objects with type/value/column) and old format (simple strings)
    if (paramKeys.length > 0 && data.components) {
      const paramValues = paramKeys.map((key) => {
        const param = parameters[key];
        // Handle new structure: { type: "text", value: "..." } or { type: "column", column: "..." }
        if (param && typeof param === "object" && param.type) {
          if (param.type === "text") {
            return param.value || "";
          }
          if (param.type === "column") {
            // For preview, show the column name in brackets to indicate it's dynamic
            return `[${param.column || ""}]`;
          }
          // Fallback: try to get value if it exists
          return param.value || param.column || "";
        }
        // Handle old structure: simple string value
        return param || "";
      });
      const bodyComponent = data.components.find((c) => c.type === "BODY");
      if (bodyComponent) {
        data.exampleVariables = paramValues
          .filter((v) => v !== "" && v !== undefined && v !== null)
          .map((v) => ({ value: v }));
      }
    }

    return data;
  }, [selectedTemplate, paramKeys, parameters]);

  // Memoize recipient count label
  const recipientCountLabel = useMemo(
    () => `${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}`,
    [recipientCount]
  );

  // Memoize preview message
  const previewMessage = useMemo(() => {
    if (!templateName) return "Select a template to see preview";
    if (templateLoading) return "Loading template...";
    return "Preview unavailable";
  }, [templateName, templateLoading]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Broadcast Summary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review all selections before creating the broadcast
      </Typography>

      {/* Two-Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column: Details */}
        <Grid item>
          <Stack spacing={2}>
            {/* Recipients Details */}
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Recipients
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Chip
                    label={recipientCountLabel}
                    color={recipientCount > 0 ? "success" : "default"}
                    size="small"
                  />
                  <Chip
                    label={`Source: ${recipientSource}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Box>
                {recipientCount === 0 && (
                  <Typography variant="body2" color="error">
                    No recipients selected
                  </Typography>
                )}
                {hasFilterCriteria && filterStats && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    Filter criteria: {filterStats.rulesCount} rule(s),{" "}
                    {filterStats.groupsCount} group(s)
                  </Typography>
                )}
                {recipientCount > 0 && recipientDetails.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 1 }}
                    >
                      Recipient List ({recipientDetails.length})
                    </Typography>
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{
                        maxHeight: 300,
                        overflow: "auto",
                      }}
                    >
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {TABLE_HEAD_CELLS.map((cell) => (
                              <TableCell
                                key={cell.key}
                                sx={{
                                  fontWeight: 600,
                                  backgroundColor: "background.paper",
                                }}
                              >
                                {cell.label}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {isLoadingDetails ? (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                    py: 2,
                                  }}
                                >
                                  <CircularProgress size={20} />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Loading recipient details...
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : (
                            recipientDetails.map((recipient, index) => (
                              <TableRow
                                key={`${recipient.phone}-${index}`}
                                hover
                                sx={{
                                  backgroundColor: recipient.matched
                                    ? "action.selected"
                                    : "transparent",
                                }}
                              >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{recipient.phone}</TableCell>
                                <TableCell>{recipient.ITS_ID}</TableCell>
                                <TableCell>{recipient.Full_Name}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Preview */}
        <Grid item>
          {templateName && previewData ? (
            <BroadcastPreview />
          ) : (
            <Card variant="outlined">
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ py: 4 }}
                >
                  {previewMessage}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SummaryStep;
