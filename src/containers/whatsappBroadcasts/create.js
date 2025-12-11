import React, { useState } from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
  useNotify,
  useRedirect,
  useDataProvider,
  FormDataConsumer,
  ArrayInput,
  SimpleFormIterator,
  useGetList,
} from "react-admin";
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { TemplatePreview } from "../whatsappTemplates/shared";

const TemplateSelector = ({ onChange, value }) => {
  const { data: templates, isLoading } = useGetList("whatsappTemplates", {
    filter: { status: "APPROVED" },
    pagination: { page: 1, perPage: 1000 },
  });

  if (isLoading) return <Typography>Loading templates...</Typography>;

  const approvedTemplates = templates || [];

  return (
    <SelectInput
      source="templateName"
      label="Template"
      choices={approvedTemplates.map((t) => ({
        id: t.name,
        name: `${t.name} (${t.category})`,
      }))}
      validate={required()}
      onChange={(e) => {
        onChange?.(e);
        const selectedTemplate = approvedTemplates.find(
          (t) => t.name === e.target.value
        );
        // You can set default parameters here if needed
      }}
    />
  );
};

const RecipientFilters = () => {
  const { data: sectors } = useGetList("itsdata", {
    pagination: { page: 1, perPage: 1000 },
  });

  const uniqueSectors = [
    ...new Set(
      (sectors || []).map((s) => s.Sector).filter((s) => s && s.trim() !== "")
    ),
  ].sort();

  const uniqueSubSectors = [
    ...new Set(
      (sectors || [])
        .map((s) => s.Sub_Sector)
        .filter((s) => s && s.trim() !== "")
    ),
  ].sort();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Filter Recipients from ITS Data
      </Typography>
      <FormDataConsumer>
        {({ formData, ...rest }) => (
          <>
            <SelectInput
              source="filterCriteria.sector"
              label="Sector"
              choices={uniqueSectors.map((s) => ({ id: s, name: s }))}
              multiple
            />
            <SelectInput
              source="filterCriteria.subSector"
              label="Sub-Sector"
              choices={uniqueSubSectors.map((s) => ({ id: s, name: s }))}
              multiple
            />
            <SelectInput
              source="filterCriteria.hofFmType"
              label="Type"
              choices={[
                { id: "HOF", name: "Head of Family" },
                { id: "FM", name: "Family Member" },
              ]}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              OR: Manual Phone Numbers
            </Typography>
            <TextInput
              source="recipientPhoneNumbers"
              label="Phone Numbers (one per line)"
              multiline
              rows={6}
              helperText="Enter phone numbers, one per line. Will be formatted automatically."
              format={(value) =>
                Array.isArray(value) ? value.join("\n") : value
              }
              parse={(value) => {
                if (!value) return [];
                return value
                  .split("\n")
                  .map((p) => p.trim())
                  .filter((p) => p.length > 0);
              }}
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              OR: Specific ITS IDs
            </Typography>
            <TextInput
              source="recipientItsIds"
              label="ITS IDs (comma-separated)"
              helperText="Enter ITS IDs separated by commas"
              format={(value) =>
                Array.isArray(value) ? value.join(", ") : value
              }
              parse={(value) => {
                if (!value) return [];
                return value
                  .split(",")
                  .map((id) => id.trim())
                  .filter((id) => id.length > 0);
              }}
            />
          </>
        )}
      </FormDataConsumer>
    </Box>
  );
};

const ParameterMapper = ({ templateName }) => {
  const { data: templates, isLoading } = useGetList("whatsappTemplates", {
    filter: { name: templateName },
    pagination: { page: 1, perPage: 1 },
  });

  if (!templateName) {
    return (
      <Alert severity="info">
        Select a template first to configure parameters
      </Alert>
    );
  }

  if (isLoading) {
    return <Typography>Loading template...</Typography>;
  }

  const selectedTemplate = templates?.[0];
  if (!selectedTemplate) {
    return <Typography>Template not found</Typography>;
  }

  // Extract variables from body text
  const bodyText = selectedTemplate.bodyText || "";
  const variableMatches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
  const variables = variableMatches.map((m) => {
    const num = parseInt(m.replace(/\{\{|\}\}/g, ""), 10);
    return { number: num, placeholder: m };
  });

  if (variables.length === 0) {
    return (
      <Alert severity="info">
        This template has no variables. No parameters needed.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Template Parameters
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter values for each template variable. These will be sent to all
        recipients.
      </Typography>
      {variables.map((variable) => (
        <TextInput
          key={variable.number}
          source={`parameters.${variable.number}`}
          label={variable.placeholder}
          validate={required()}
          fullWidth
          sx={{ mb: 2 }}
        />
      ))}
      <Alert severity="info" sx={{ mt: 2 }}>
        Note: Currently, all recipients receive the same parameter values.
        Per-recipient parameter mapping will be added in a future update.
      </Alert>
    </Box>
  );
};

const BroadcastPreview = ({ formData }) => {
  const { data: templates, isLoading } = useGetList("whatsappTemplates", {
    filter: { name: formData?.templateName },
    pagination: { page: 1, perPage: 1 },
  });

  if (!formData?.templateName) {
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

  const selectedTemplate = templates?.[0];
  if (!selectedTemplate) {
    return <Typography>Template not found</Typography>;
  }

  const previewData = {
    ...selectedTemplate,
    components: selectedTemplate.components || [],
  };

  // Replace variables with form parameters
  if (formData.parameters && typeof formData.parameters === "object") {
    const paramValues = Object.keys(formData.parameters)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key) => formData.parameters[key])
      .filter(Boolean);
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
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preview
          </Typography>
          <TemplatePreview formData={previewData} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const [tabValue, setTabValue] = useState(0);

  const transform = (data) => {
    // Parameters are already in object format (parameters.1, parameters.2, etc.)
    // Convert to array format expected by backend
    const parameters = {};
    if (data.parameters && typeof data.parameters === "object") {
      Object.keys(data.parameters).forEach((key) => {
        const value = data.parameters[key];
        if (value !== undefined && value !== null && value !== "") {
          parameters[key] = String(value);
        }
      });
    }

    return {
      templateName: data.templateName,
      name: data.name,
      parameters: parameters,
      filterCriteria: data.filterCriteria || null,
      recipientPhoneNumbers: data.recipientPhoneNumbers || null,
      recipientItsIds: data.recipientItsIds || null,
      createdBy: data.createdBy || "admin", // TODO: Get from auth context
    };
  };

  const onSuccess = (data) => {
    notify("Broadcast created successfully. Messages are being sent.", {
      type: "success",
    });
    redirect("show", "whatsappBroadcasts", data.id);
  };

  return (
    <Create
      transform={transform}
      mutationOptions={{ onSuccess }}
      title="Create WhatsApp Broadcast"
    >
      <SimpleForm>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box sx={{ flex: { md: "0 0 60%" } }}>
            <TextInput
              source="name"
              label="Broadcast Name"
              validate={required()}
              helperText="A descriptive name for this broadcast"
            />

            <Divider sx={{ my: 2 }} />

            <FormDataConsumer>
              {({ formData, ...rest }) => (
                <TemplateSelector
                  value={formData?.templateName}
                  onChange={(e) => {
                    // Template selection handled by SelectInput
                  }}
                />
              )}
            </FormDataConsumer>

            <Divider sx={{ my: 2 }} />

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Recipients" />
              <Tab label="Parameters" />
            </Tabs>

            {tabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                <RecipientFilters />
              </Box>
            )}

            {tabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                <FormDataConsumer>
                  {({ formData }) => (
                    <ParameterMapper templateName={formData?.templateName} />
                  )}
                </FormDataConsumer>
              </Box>
            )}
          </Box>

          <Box sx={{ flex: { md: "0 0 35%" } }}>
            <FormDataConsumer>
              {({ formData }) => <BroadcastPreview formData={formData} />}
            </FormDataConsumer>
          </Box>
        </Box>
      </SimpleForm>
    </Create>
  );
};
