import { useWatch } from "react-hook-form";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { TemplatePreview } from "@/containers/whatsapp-templates/WhatsappTemplateShared";
import { useTemplateContext } from "@/containers/whatsapp-broadcasts/context";
import type { RaRecord } from "react-admin";
import type { BroadcastParameter } from "./utils";

type TemplateWithComponents = RaRecord & {
  components?: { type: string }[];
  exampleVariables?: { value: string }[];
};

const BroadcastPreview = () => {
  const templateName = useWatch({ name: "templateName" });
  const parameters = useWatch({ name: "parameters" }) as
    | Record<string, BroadcastParameter>
    | undefined;

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
          ? `Error loading template: ${(error as Error).message}`
          : `Template not found${templateName ? `: ${templateName}` : ""}`}
      </Typography>
    );
  }

  const previewData: TemplateWithComponents = {
    ...selectedTemplate,
    components: selectedTemplate.components || [],
  };

  if (parameters && typeof parameters === "object") {
    const paramValues = Object.keys(parameters)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .map((key) => {
        const param = parameters[key];
        if (param && typeof param === "object") {
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
      })
      .filter((v) => v !== "" && v !== undefined && v !== null);
    if (paramValues.length > 0 && previewData.components) {
      const bodyComponent = previewData.components.find((c) => c.type === "BODY");
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
