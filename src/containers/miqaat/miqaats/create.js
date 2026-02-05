import React from "react";
import { Create, SimpleForm, TextInput, DateInput, SelectInput } from "react-admin";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";
import { MEAL_TYPE_CHOICES, VENUE_CHOICES } from "../../../constants";

export default (props) => (
  <Create {...props} redirect="list">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 500 }}>
      <TextInput source="name" label="Name" fullWidth isRequired />
      <SelectInput source="venue" label="Venue" choices={VENUE_CHOICES} fullWidth isRequired />
      <DateInput source="englishDate" label="Date" fullWidth isRequired />
      <NoArrowKeyNumberInput
        source="hijriMonth"
        label="Hijri Month (0-11)"
        fullWidth
        min={0}
        max={11}
        helperText="0 = Moharram, 1 = Safar, ..., 11 = Zilhaj"
      />
      <NoArrowKeyNumberInput
        source="hijriDay"
        label="Hijri Day (1-30)"
        fullWidth
        min={1}
        max={30}
      />
      <SelectInput
        source="mealType"
        label="Slot"
        choices={MEAL_TYPE_CHOICES}
        fullWidth
        isRequired
      />
    </SimpleForm>
  </Create>
);
