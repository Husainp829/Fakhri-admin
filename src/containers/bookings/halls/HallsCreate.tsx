import { Create, SimpleForm, TextInput, minValue, type CreateProps } from "react-admin";
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
      defaultValue={0}
      validate={[minValue(0)]}
    />
    <HallColorInput
      source="color"
      label="Calendar color"
      helperText="Leave on Auto to use the legacy short-code colors in the calendar until you pick a color."
    />
  </>
);

export const HallsCreate = (props: CreateProps) => (
  <Create {...props} redirect="list">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 560 }}>
      <HallFormFields />
    </SimpleForm>
  </Create>
);

export default HallsCreate;
