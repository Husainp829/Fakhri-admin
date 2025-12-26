import React from "react";
import {
  TextInput,
  SelectInput,
  required,
  ArrayInput,
  SimpleFormIterator,
  FormDataConsumer,
  useRecordContext,
} from "react-admin";
import { useWatch } from "react-hook-form";
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import { format } from "../../utils/whatsappFormatter";

/**
 * Template Preview Component
 * Shows WhatsApp-style preview of the template
 */
export const TemplatePreview = ({ formData }) => {
  if (!formData) {
    return (
      <Box
        sx={{
          position: "sticky",
          top: 20,
          height: "fit-content",
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Template Preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the form to see preview
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const bodyComponent = formData.components?.find((c) => c.type === "BODY");
  const headerComponent = formData.components?.find((c) => c.type === "HEADER");
  const footerComponent = formData.components?.find((c) => c.type === "FOOTER");
  const buttonsComponent = formData.components?.find(
    (c) => c.type === "BUTTONS"
  );

  return (
    <Box
      sx={{
        position: "sticky",
        top: 20,
        height: "fit-content",
      }}
    >
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            WhatsApp Preview
          </Typography>

          {/* WhatsApp-style message bubble */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#DCF8C6",
              borderRadius: "7.5px",
              borderBottomRightRadius: "0px",
              p: 2,
              mb: 1,
              maxWidth: "320px",
              position: "relative",
              "&::after": {
                // eslint-disable-next-line quotes
                content: '""',
                position: "absolute",
                bottom: 0,
                right: -8,
                width: 0,
                height: 0,
                borderLeft: "8px solid #DCF8C6",
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
              },
            }}
          >
            {/* Header */}
            {headerComponent && (
              <Box
                sx={{
                  mb: 1.5,
                  pb: 1.5,
                  borderBottom: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                {headerComponent.format === "TEXT" && headerComponent.text ? (
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{
                      fontWeight: 600,
                      color: "#000",
                      "& strong": {
                        fontWeight: 700,
                      },
                      "& i": {
                        fontStyle: "italic",
                      },
                      "& s": {
                        textDecoration: "line-through",
                      },
                      "& code": {
                        fontFamily: "monospace",
                        backgroundColor: "rgba(0,0,0,0.05)",
                        padding: "2px 4px",
                        borderRadius: "3px",
                      },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: format(headerComponent.text),
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      bgcolor: "#E5E5E5",
                      borderRadius: 1,
                      p: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {headerComponent.format || "MEDIA"}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Body */}
            {bodyComponent && (
              <Typography
                variant="body2"
                component="div"
                sx={{
                  color: "#000",
                  whiteSpace: "pre-wrap",
                  mb: footerComponent || buttonsComponent ? 1.5 : 0,
                  lineHeight: 1.5,
                  "& strong": {
                    fontWeight: 600,
                  },
                  "& i": {
                    fontStyle: "italic",
                  },
                  "& s": {
                    textDecoration: "line-through",
                  },
                  "& code": {
                    fontFamily: "monospace",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    padding: "2px 4px",
                    borderRadius: "3px",
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    let text = bodyComponent.text || "";
                    // Use form example variables if available, then Meta API values, then defaults
                    let sampleValues = null;
                    if (
                      formData?.exampleVariables &&
                      formData.exampleVariables.length > 0
                    ) {
                      // Use values from form
                      sampleValues = formData.exampleVariables.map(
                        (v) => v.value
                      );
                    } else if (
                      formData?.bodyExampleValues ||
                      formData?.components?.find((c) => c.type === "BODY")
                        ?.example?.body_text?.[0]
                    ) {
                      // Use Meta API example values
                      sampleValues =
                        formData?.bodyExampleValues ||
                        formData?.components?.find((c) => c.type === "BODY")
                          ?.example?.body_text?.[0];
                    } else {
                      // Default samples
                      sampleValues = [
                        "John",
                        "ORD-12345",
                        "10:00 AM",
                        "₹1,500",
                        "2024-01-15",
                      ];
                    }
                    text = text.replace(/\{\{(\d+)\}\}/g, (match, num) => {
                      const index = parseInt(num, 10) - 1;
                      return sampleValues?.[index] || match;
                    });
                    // Format the text using WhatsApp formatter
                    return format(text);
                  })(),
                }}
              />
            )}

            {/* Footer */}
            {footerComponent && (
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1,
                  borderTop: buttonsComponent
                    ? "1px solid rgba(0,0,0,0.1)"
                    : "none",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#667781",
                    fontSize: "0.75rem",
                  }}
                >
                  {footerComponent.text || ""}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Buttons */}
          {buttonsComponent?.buttons && buttonsComponent.buttons.length > 0 && (
            <Box sx={{ mt: 2, maxWidth: "320px" }}>
              {buttonsComponent.buttons.map((button, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E5E5E5",
                    borderRadius: "8px",
                    p: 1.5,
                    mb: 1,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "#F5F5F5",
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#0084FF",
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    {(() => {
                      if (button.type === "QUICK_REPLY") return button.text;
                      if (button.type === "URL") {
                        return `${button.text || "Visit"} →`;
                      }
                      if (button.type === "PHONE_NUMBER") {
                        return `📞 ${button.text || button.phone_number}`;
                      }
                      return button.text || button.url || "";
                    })()}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}

          {!bodyComponent && !headerComponent && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Add body text to see preview
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

/**
 * Transform form data to Meta API format
 */
export const transformTemplateData = (data) => {
  const components = [];

  // Add header if provided
  if (data.headerType && data.headerText) {
    components.push({
      type: "HEADER",
      format: data.headerType,
      text: data.headerText,
    });
  }

  // Add body (required)
  if (data.bodyText) {
    const bodyComponent = {
      type: "BODY",
      text: data.bodyText,
    };
    // Add example values if provided
    if (data.exampleVariables && data.exampleVariables.length > 0) {
      bodyComponent.example = {
        body_text: [data.exampleVariables.map((v) => v.value)],
      };
    }
    components.push(bodyComponent);
  }

  // Add footer if provided
  if (data.footerText) {
    components.push({
      type: "FOOTER",
      text: data.footerText,
    });
  }

  // Add buttons if provided
  if (data.buttons && data.buttons.length > 0) {
    const buttonComponents = data.buttons
      .filter((btn) => btn.type && (btn.text || btn.url || btn.phone_number))
      .map((btn) => {
        const button = { type: btn.type };
        if (btn.type === "QUICK_REPLY" && btn.text) {
          button.text = btn.text;
        } else if (btn.type === "URL" && btn.url) {
          button.url = btn.url;
          if (btn.text) button.text = btn.text;
        } else if (btn.type === "PHONE_NUMBER" && btn.phone_number) {
          button.phone_number = btn.phone_number;
          if (btn.text) button.text = btn.text;
        }
        return button;
      });

    if (buttonComponents.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: buttonComponents,
      });
    }
  }

  return {
    name: data.name,
    category: data.category,
    language: data.language || "en_US",
    components,
  };
};

/**
 * Example Variables Input Component
 * Dynamically shows input fields for variables found in body text
 */
export const ExampleVariablesInput = () => (
  <FormDataConsumer>
    {({ formData }) => {
      // Count variables in body text
      const bodyText = formData?.bodyText || "";
      const variableMatches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
      const maxVar = variableMatches.length
        ? Math.max(
            ...variableMatches.map((m) =>
              parseInt(m.replace(/\{\{|\}\}/g, ""), 10)
            )
          )
        : 0;

      if (maxVar === 0) return null;

      return (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Example Variable Values
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These values will be used in the preview and submitted to Meta for
            template approval.
          </Typography>
          <ArrayInput source="exampleVariables" label="">
            <SimpleFormIterator>
              <TextInput
                source="value"
                label={(record) => `{{${record.index + 1}}}`}
                validate={required()}
              />
            </SimpleFormIterator>
          </ArrayInput>
        </>
      );
    }}
  </FormDataConsumer>
);

/**
 * Live Preview Component for Create Form
 */
export const LivePreviewCreate = ({ transform }) => {
  const formData = useWatch();
  const transformedData = transform(formData);
  // Add example variables from form to transformed data for preview
  if (formData?.exampleVariables && formData.exampleVariables.length > 0) {
    transformedData.exampleVariables = formData.exampleVariables.map(
      (v) => v.value
    );
  }
  return (
    <Box
      sx={{
        width: "35%",
        maxWidth: 400,
      }}
    >
      <TemplatePreview formData={transformedData} />
    </Box>
  );
};

/**
 * Live Preview Component for Edit Form
 */
export const LivePreviewEdit = ({ transform }) => {
  const formData = useWatch();
  const record = useRecordContext();
  const transformedData = transform(formData);
  // Add example variables from form to transformed data for preview
  if (formData?.exampleVariables && formData.exampleVariables.length > 0) {
    transformedData.exampleVariables = formData.exampleVariables.map(
      (v) => v.value
    );
  } else if (record?.bodyExampleValues) {
    // Fallback to record values if form doesn't have exampleVariables
    transformedData.bodyExampleValues = record.bodyExampleValues;
  } else if (record?.components) {
    const bodyComponent = record.components.find((c) => c.type === "BODY");
    if (bodyComponent?.example?.body_text?.[0]) {
      // eslint-disable-next-line prefer-destructuring
      transformedData.bodyExampleValues = bodyComponent.example.body_text[0];
    }
  }
  return (
    <Box
      sx={{
        width: "35%",
        maxWidth: 400,
      }}
    >
      <TemplatePreview formData={transformedData} />
    </Box>
  );
};

/**
 * Common Template Form Fields
 */
export const TemplateFormFields = ({ isEdit = false }) => (
  <>
    <TextInput source="name" label="Template Name" validate={required()} />
    <SelectInput
      source="category"
      label="Category"
      choices={[
        { id: "UTILITY", name: "Utility" },
        { id: "MARKETING", name: "Marketing" },
        { id: "AUTHENTICATION", name: "Authentication" },
      ]}
      validate={required()}
    />
    <TextInput
      source="language"
      label="Language Code"
      defaultValue={isEdit ? undefined : "en_US"}
      validate={required()}
      helperText="e.g., en_US, en_GB, ar"
    />

    <Divider sx={{ my: 2 }} />
    <Typography variant="h6">Header (Optional)</Typography>
    <SelectInput
      source="headerType"
      label="Header Type"
      choices={[
        { id: "TEXT", name: "Text" },
        { id: "IMAGE", name: "Image" },
        { id: "VIDEO", name: "Video" },
        { id: "DOCUMENT", name: "Document" },
      ]}
    />
    {isEdit ? (
      <FormDataConsumer>
        {({ record, formData }) => {
          // Map headerContent to headerText for form
          const headerText =
            formData?.headerText || record?.headerContent || "";
          return (
            <TextInput
              source="headerText"
              label="Header Content"
              multiline
              rows={2}
              defaultValue={headerText}
              parse={(value) => value}
              format={(value) => value || record?.headerContent || ""}
              helperText="For TEXT format only. For media formats, upload via Meta Business Manager."
            />
          );
        }}
      </FormDataConsumer>
    ) : (
      <TextInput
        source="headerText"
        label="Header Content"
        multiline
        rows={2}
        helperText="For TEXT format only. For media formats, upload via Meta Business Manager."
      />
    )}

    <Divider sx={{ my: 2 }} />
    <Typography variant="h6">Body (Required)</Typography>
    <TextInput
      source="bodyText"
      label="Body Text"
      multiline
      rows={6}
      validate={required()}
      helperText="Use {{1}}, {{2}}, etc. for parameters"
    />
    <ExampleVariablesInput />

    <Divider sx={{ my: 2 }} />
    <Typography variant="h6">Footer (Optional)</Typography>
    <TextInput
      source="footerText"
      label="Footer Text"
      multiline
      rows={2}
      helperText="Maximum 60 characters"
    />

    <Divider sx={{ my: 2 }} />
    <Typography variant="h6">Buttons (Optional)</Typography>
    <ArrayInput source="buttons">
      <SimpleFormIterator>
        <SelectInput
          source="type"
          label="Button Type"
          choices={[
            { id: "QUICK_REPLY", name: "Quick Reply" },
            { id: "URL", name: "URL" },
            { id: "PHONE_NUMBER", name: "Phone Number" },
          ]}
        />
        <FormDataConsumer>
          {/* eslint-disable-next-line no-unused-vars */}
          {({ _, scopedFormData }) => {
            if (scopedFormData?.type === "QUICK_REPLY") {
              return (
                <TextInput
                  source="text"
                  label="Button Text"
                  validate={required()}
                />
              );
            }
            if (scopedFormData?.type === "URL") {
              return (
                <>
                  <TextInput source="text" label="Button Text" />
                  <TextInput source="url" label="URL" validate={required()} />
                </>
              );
            }
            if (scopedFormData?.type === "PHONE_NUMBER") {
              return (
                <>
                  <TextInput source="text" label="Button Text" />
                  <TextInput
                    source="phone_number"
                    label="Phone Number"
                    validate={required()}
                  />
                </>
              );
            }
            return null;
          }}
        </FormDataConsumer>
      </SimpleFormIterator>
    </ArrayInput>
  </>
);
