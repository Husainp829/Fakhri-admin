import React from "react";
import { useWatch } from "react-hook-form";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { TemplatePreview } from "../../whatsappTemplates/shared";
import { useTemplateContext } from "../context";

/**
 * BroadcastPreview Component
 *
 * React Admin field component that displays a preview of the selected template
 * with filled parameters. Watches form data from form context.
 */
const BroadcastPreview = () => {
  // Watch form data from form context
  const templateName = useWatch({ name: "templateName" });
  const parameters = useWatch({ name: "parameters" });

  // Use template from context (fetched once at parent level)
  const { data: selectedTemplate, isLoading, error } = useTemplateContext();

  if (!templateName) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Select a template to see preview
          </Typography>
        </CardContent>
      </Card>
    );
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

  const previewData = {
    ...selectedTemplate,
    components: selectedTemplate.components || [],
  };

  // Replace variables with form parameters
  // Handle both old format (simple string values) and new format (objects with type/value/column)
  if (parameters && typeof parameters === "object") {
    const paramValues = Object.keys(parameters)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .map((key) => {
        const param = parameters[key];
        // Handle new structure: { type: "text", value: "..." } or { type: "column", column: "Full_Name" }
        if (param && typeof param === "object") {
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
      })
      .filter((v) => v !== "" && v !== undefined && v !== null);
    if (paramValues.length > 0 && previewData.components) {
      const bodyComponent = previewData.components.find(
        (c) => c.type === "BODY"
      );
      if (bodyComponent) {
        previewData.exampleVariables = paramValues.map((v) => ({ value: v }));
      }
    }
  }

  return (
    <Box sx={{ position: "sticky", top: 20 }}>
      <Card>
        <CardContent sx={{ py: 1, px: 1.5, "&:last-child": { pb: 1 } }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
            Preview
          </Typography>
          <TemplatePreview formData={previewData} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default BroadcastPreview;
