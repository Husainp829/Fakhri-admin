import React from "react";
import { Create, SimpleForm, useNotify, useRedirect } from "react-admin";
import { Box } from "@mui/material";
import {
  transformTemplateData,
  LivePreviewCreate,
  TemplateFormFields,
} from "./shared";

export default () => {
  const notify = useNotify();
  const redirect = useRedirect();

  const transform = transformTemplateData;

  const onSuccess = () => {
    notify(
      "Template created successfully. It will be submitted to Meta for approval.",
      {
        type: "success",
      }
    );
    redirect("list", "whatsappTemplates");
  };

  return (
    <Create
      transform={transform}
      mutationOptions={{ onSuccess }}
      title="Create WhatsApp Template"
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
            <TemplateFormFields isEdit={false} />
          </Box>
          <LivePreviewCreate transform={transform} />
        </Box>
      </SimpleForm>
    </Create>
  );
};
