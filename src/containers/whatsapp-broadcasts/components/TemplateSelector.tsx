import { ReferenceInput, SelectInput, required } from "react-admin";

const TemplateSelector = (props: Record<string, unknown>) => (
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
