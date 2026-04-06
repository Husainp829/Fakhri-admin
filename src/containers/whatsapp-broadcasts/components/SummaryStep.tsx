import { useMemo } from "react";
import { useWatch, useFormContext } from "react-hook-form";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
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
import Grid from "@mui/material/Grid";
import {
  useTemplateContext,
  useRecipientSelection,
} from "@/containers/whatsapp-broadcasts/context";
import BroadcastPreview from "./BroadcastPreview";
import type { BroadcastParameter } from "./utils";
import type { FilterGroupData } from "./advanced-filter-builder/constants";
import type { RaRecord } from "react-admin";

const TABLE_HEAD_CELLS = [
  { label: "#", key: "index" },
  { label: "Phone Number", key: "phone" },
  { label: "ITS ID", key: "itsId" },
  { label: "Full Name", key: "fullName" },
] as const;

type SummaryFormData = {
  name?: string;
  templateName?: string;
  parameters?: Record<string, BroadcastParameter>;
  filterCriteria?: FilterGroupData;
};

const SummaryStep = () => {
  const { control } = useFormContext();

  const name = useWatch({ control, name: "name" });
  const templateName = useWatch({ control, name: "templateName" });
  const parameters = useWatch({
    control,
    name: "parameters",
    defaultValue: {},
  }) as Record<string, BroadcastParameter>;
  const filterCriteria = useWatch({ control, name: "filterCriteria" }) as
    | FilterGroupData
    | undefined;

  const formData = useMemo(
    (): SummaryFormData => ({
      name,
      templateName,
      parameters,
      filterCriteria,
    }),
    [name, templateName, parameters, filterCriteria]
  );

  return <SummaryContent formData={formData} />;
};

type SummaryContentProps = { formData: SummaryFormData };

const SummaryContent = ({ formData }: SummaryContentProps) => {
  const templateName = formData?.templateName;
  const parameters = formData?.parameters || {};
  const filterCriteria = formData?.filterCriteria;

  const { recipientCount, recipientDetails, isLoadingDetails } = useRecipientSelection();

  const { data: selectedTemplate, isLoading: templateLoading } = useTemplateContext();

  const { hasFilterCriteria, recipientSource, filterStats } = useMemo(() => {
    const hasRules = filterCriteria?.rules && filterCriteria.rules.length > 0;
    const hasGroups = filterCriteria?.groups && filterCriteria.groups.length > 0;
    const hasFilter = !!(hasRules || hasGroups);

    return {
      hasFilterCriteria: hasFilter,
      recipientSource: hasFilter ? "Filter" : "None",
      filterStats: hasFilter
        ? {
            rulesCount: filterCriteria?.rules?.length || 0,
            groupsCount: filterCriteria?.groups?.length || 0,
          }
        : null,
    };
  }, [filterCriteria]);

  const paramKeys = useMemo(
    () =>
      Object.keys(parameters)
        .filter((key) => {
          const param = parameters[key];
          if (!param) return false;

          if (param && typeof param === "object" && param.type) {
            if (param.type === "text") {
              return param.value && String(param.value).trim() !== "";
            }
            if (param.type === "column") {
              return param.column && String(param.column).trim() !== "";
            }
            return false;
          }

          return String(param).trim() !== "";
        })
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10)),
    [parameters]
  );

  const previewData = useMemo(() => {
    if (!selectedTemplate) return null;

    const data: RaRecord & {
      components?: { type: string }[];
      exampleVariables?: { value: string }[];
    } = {
      ...selectedTemplate,
      components: selectedTemplate.components || [],
    };

    if (paramKeys.length > 0 && data.components) {
      const paramValues = paramKeys.map((key) => {
        const param = parameters[key];
        if (param && typeof param === "object" && param.type) {
          if (param.type === "text") {
            return String(param.value ?? "");
          }
          if (param.type === "column") {
            const label =
              param.columnSource === "csv"
                ? `CSV: ${param.column || ""}`
                : String(param.column || "");
            return `[${label}]`;
          }
          return String(param.value ?? param.column ?? "");
        }
        return String(param ?? "");
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

  const recipientCountLabel = useMemo(
    () => `${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}`,
    [recipientCount]
  );

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
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Recipients
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
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
                    Filter criteria: {filterStats.rulesCount} rule(s), {filterStats.groupsCount}{" "}
                    group(s)
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
                                  <Typography variant="body2" color="text.secondary">
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

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          {templateName && previewData ? (
            <BroadcastPreview />
          ) : (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
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
