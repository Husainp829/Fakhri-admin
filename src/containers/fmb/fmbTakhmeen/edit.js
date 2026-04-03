import React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  DateInput,
  required,
  minValue,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";
import { ITSInput } from "./common/itsInput";
import { TakhmeenYearSelect, transformTakhmeenUpdate } from "./common/takhmeenFormShared";

export default function FmbTakhmeenEdit(props) {
  return (
    <Edit {...props} transform={transformTakhmeenUpdate} mutationMode="pessimistic">
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 720 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ReferenceInput source="fmbId" reference="fmbData" perPage={100}>
              <ITSInput
                label="FMB record"
                optionText={(r) => `${r.fileNo ?? "—"} · ITS ${r.itsNo ?? "—"}`}
                fullWidth
                disabled
                debounce={300}
              />
            </ReferenceInput>
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
            <DateInput
              source="startDate"
              label="Effective from (date)"
              fullWidth
              validate={[required()]}
            />
          </Grid>
          <TakhmeenYearSelect />
        </Grid>
      </SimpleForm>
    </Edit>
  );
}
