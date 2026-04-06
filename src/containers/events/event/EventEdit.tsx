import {
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  required,
  Title,
  type EditProps,
} from "react-admin";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

const EventTitle = () => "Edit Event";

export const EventEdit = (props: EditProps) => (
  <>
    <Title title="" />
    <Edit {...props} mutationMode="optimistic" title={<EventTitle />} redirect="/events">
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
        <TextInput source="name" fullWidth validate={required()} />
        <DateInput source="fromDate" fullWidth validate={required()} />
        <DateInput source="toDate" fullWidth validate={required()} />
        <TextInput
          source="hijriYear"
          fullWidth
          validate={required()}
          helperText="Hijri year (e.g., 1445)"
        />
        <TextInput
          source="slug"
          fullWidth
          validate={required()}
          helperText="URL-friendly identifier (e.g., ashara-mubaraka-1445)"
        />
        <NoArrowKeyNumberInput
          source="zabihat"
          fullWidth
          helperText="Number of zabihat (optional)"
        />
        <NoArrowKeyNumberInput source="chairs" fullWidth helperText="Number of chairs (optional)" />
      </SimpleForm>
    </Edit>
  </>
);
