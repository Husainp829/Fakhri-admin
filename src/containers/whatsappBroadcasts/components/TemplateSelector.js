import React from "react";
import { ReferenceInput, SelectInput, required } from "react-admin";

/**
 * TemplateSelector Component
 *
 * React Admin input component for selecting a WhatsApp template.
 * Uses ReferenceInput to fetch approved templates and displays them in a SelectInput.
 */
const TemplateSelector = (props) => (
  <ReferenceInput
    source="templateName"
    reference="whatsappTemplates"
    filter={{ status: "APPROVED" }}
    perPage={1000}
    {...props}
  >
    <SelectInput
      label="Template"
      optionText={(record) => `${record.name} (${record.category})`}
      optionValue="name"
      validate={required()}
    />
  </ReferenceInput>
);

export default TemplateSelector;
