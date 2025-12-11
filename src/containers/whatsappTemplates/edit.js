import React, { useEffect } from "react";
import {
  Edit,
  SimpleForm,
  useNotify,
  useRedirect,
  useRecordContext,
  FunctionField,
} from "react-admin";
import { useFormContext } from "react-hook-form";
import { Box, Chip, Alert } from "@mui/material";
import {
  transformTemplateData,
  LivePreviewEdit,
  TemplateFormFields,
} from "./shared";

const StatusAlert = () => {
  const record = useRecordContext();

  if (!record) return null;

  const canEdit =
    record.status === "APPROVED" ||
    record.status === "REJECTED" ||
    record.status === "PAUSED";

  if (!canEdit) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        This template cannot be edited. Current status: {record.status}.
        Templates can only be edited when status is APPROVED, REJECTED, or
        PAUSED.
      </Alert>
    );
  }

  if (record.status === "APPROVED") {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Editing an approved template may require re-approval from Meta.
      </Alert>
    );
  }

  return null;
};

export default () => {
  const notify = useNotify();
  const redirect = useRedirect();

  const transform = transformTemplateData;

  const onSuccess = (data) => {
    notify(
      "Template updated successfully. It may require re-approval from Meta.",
      {
        type: "success",
      }
    );
    redirect("show", "whatsappTemplates", data.id);
  };

  const RecordTransformer = () => {
    const record = useRecordContext();
    const { setValue } = useFormContext();

    useEffect(() => {
      if (record) {
        // Transform record fields to form fields
        // Header: map headerContent to headerText
        if (record.headerContent && !record.headerText) {
          setValue("headerText", record.headerContent);
        }
        // Header type
        if (record.headerType) {
          setValue("headerType", record.headerType);
        }
        // Body text
        if (record.bodyText) {
          setValue("bodyText", record.bodyText);
        }
        // Footer text
        if (record.footerText) {
          setValue("footerText", record.footerText);
        }
        // Example variables: transform bodyExampleValues to exampleVariables array
        if (
          record.bodyExampleValues &&
          Array.isArray(record.bodyExampleValues)
        ) {
          setValue(
            "exampleVariables",
            record.bodyExampleValues.map((value, index) => ({
              index,
              value,
            }))
          );
        } else if (record.components) {
          const bodyComponent = record.components.find(
            (c) => c.type === "BODY"
          );
          if (bodyComponent?.example?.body_text?.[0]) {
            setValue(
              "exampleVariables",
              bodyComponent.example.body_text[0].map((value, index) => ({
                index,
                value,
              }))
            );
          }
        }
        // Buttons: transform buttonData to buttons array
        if (
          record.buttonData &&
          Array.isArray(record.buttonData) &&
          record.buttonData.length > 0 &&
          !record.buttons
        ) {
          setValue(
            "buttons",
            record.buttonData.map((btn) => ({
              type: btn.type,
              text: btn.text,
              url: btn.url,
              phone_number: btn.phone_number,
            }))
          );
        }
      }
    }, [record, setValue]);

    return null;
  };

  return (
    <Edit
      transform={transform}
      mutationOptions={{ onSuccess }}
      title="Edit WhatsApp Template"
    >
      <SimpleForm>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Box>
            <RecordTransformer />

            <StatusAlert />

            <FunctionField
              label="Current Status"
              render={(record) => {
                let chipColor = "default";
                if (record.status === "APPROVED") chipColor = "success";
                else if (record.status === "PENDING") chipColor = "warning";
                else if (record.status === "REJECTED") chipColor = "error";

                return (
                  <Chip
                    label={record.status}
                    color={chipColor}
                    sx={{ mb: 2 }}
                  />
                );
              }}
            />

            <TemplateFormFields isEdit />
          </Box>
          <LivePreviewEdit transform={transform} />
        </Box>
      </SimpleForm>
    </Edit>
  );
};
