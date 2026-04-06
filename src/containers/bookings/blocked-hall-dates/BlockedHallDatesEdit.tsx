import {
  Edit,
  SimpleForm,
  DateInput,
  TextInput,
  ReferenceInput,
  SelectInput,
  minValue,
  maxValue,
  type EditProps,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { slotNameMap } from "@/constants";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

const BlockedHallDateForm = () => {
  const type = useWatch({ name: "type" });

  return (
    <>
      <ReferenceInput source="hallId" reference="halls" fullWidth>
        <SelectInput optionText="name" label="Hall" isRequired fullWidth />
      </ReferenceInput>
      <SelectInput
        source="slot"
        label="Slot"
        isRequired
        fullWidth
        choices={Object.entries(slotNameMap).map(([id, name]) => ({ id, name }))}
      />
      <SelectInput
        source="type"
        label="Type"
        isRequired
        fullWidth
        choices={[
          { id: "PERMANENT", name: "Permanent" },
          { id: "TEMPORARY", name: "Temporary" },
        ]}
      />
      {type === "PERMANENT" && (
        <>
          <NoArrowKeyNumberInput
            source="hijriMonth"
            label="Hijri Month (0-11)"
            fullWidth
            validate={[minValue(0), maxValue(11)]}
            helperText="0 = Moharram, 1 = Safar, ..., 11 = Zilhaj"
          />
          <NoArrowKeyNumberInput
            source="hijriDay"
            label="Hijri Day (1-30, leave empty for whole month)"
            fullWidth
            validate={[minValue(1), maxValue(30)]}
            helperText="Leave empty to block the entire month"
          />
        </>
      )}
      {type === "TEMPORARY" && (
        <DateInput source="gregorianDate" label="Gregorian Date" isRequired fullWidth />
      )}
      <TextInput source="event" label="Event/Reason" fullWidth multiline rows={3} />
    </>
  );
};

export const BlockedHallDatesEdit = (props: EditProps) => (
  <Edit {...props} mutationMode="optimistic">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <BlockedHallDateForm />
    </SimpleForm>
  </Edit>
);

export default BlockedHallDatesEdit;
