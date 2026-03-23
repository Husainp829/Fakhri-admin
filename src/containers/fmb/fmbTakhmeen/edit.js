import React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  DateInput,
  SelectInput,
  required,
  minValue,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";
import MonthInput from "../../../components/MonthInput";
import { ITSInput } from "./common/itsInput";
import {
  CATEGORY_CHOICES,
  TakhmeenYearAutoSummary,
  transformTakhmeenUpdate,
} from "./common/takhmeenFormShared";

export default function FmbTakhmeenEdit(props) {
  return (
    <Edit {...props} transform={transformTakhmeenUpdate} mutationMode="pessimistic">
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 720 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ReferenceInput source="fmbId" reference="fmbData" perPage={100}>
              <ITSInput
                label="FMB record"
                optionText={(r) => `${r.fmbNo ?? "—"} · ITS ${r.itsNo ?? "—"}`}
                fullWidth
                disabled
                debounce={300}
                filterToQuery={(q) => ({ search: q })}
              />
            </ReferenceInput>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput source="fmbNo" label="FMB number" fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput source="name" label="Account name" fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NoArrowKeyNumberInput
              source="takhmeenAmount"
              label="Takhmeen amount"
              fullWidth
              required
              validate={[required(), minValue(1)]}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SelectInput
              source="category"
              label="Category"
              choices={CATEGORY_CHOICES}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DateInput
              source="shawwalStartDate"
              label="1 Shawwal (Gregorian, optional)"
              fullWidth
              helperText="If set, Hijri year is taken from this date; else from effective month"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MonthInput source="startDate" label="Effective from (month)" validate={[required()]} />
          </Grid>
          <TakhmeenYearAutoSummary />
        </Grid>
      </SimpleForm>
    </Edit>
  );
}
