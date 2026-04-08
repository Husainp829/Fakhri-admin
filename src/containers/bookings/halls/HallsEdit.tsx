import { Edit, SimpleForm, TextInput, minValue, type EditProps } from "react-admin";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import { HallColorInput } from "@/components/HallColorInput";

const HallFormFields = () => (
  <>
    <TextInput source="name" label="Name" required fullWidth />
    <TextInput source="shortCode" label="Short code" required fullWidth />
    <NoArrowKeyNumberInput
      source="thaalCapacity"
      label="Thaal capacity"
      fullWidth
      validate={[minValue(0)]}
    />
    <HallColorInput
      source="color"
      label="Calendar color"
      helperText="Auto uses short-code colors in the calendar; a custom color overrides that for this hall."
    />
  </>
);

export const HallsEdit = (props: EditProps) => (
  <Edit {...props}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 560 }}>
      <HallFormFields />
    </SimpleForm>
  </Edit>
);

export default HallsEdit;
