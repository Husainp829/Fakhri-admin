import React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  DateInput,
  required,
  minValue,
  type EditProps,
} from "react-admin";
import Grid from "@mui/material/Grid";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import { ITSInput } from "./common/FmbTakhmeenItsInput";
import { TakhmeenYearSelect } from "./common/TakhmeenYearSelect";
import { transformTakhmeenUpdate } from "./common/takhmeen-form-transforms";

export default function FmbTakhmeenEdit(props: EditProps) {
  return (
    <Edit {...props} transform={transformTakhmeenUpdate} mutationMode="pessimistic">
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 720 }}>
        <Grid container spacing={2}>
          <Grid size={12}>
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
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <TextInput source="name" label="Account name" fullWidth disabled />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <NoArrowKeyNumberInput
              source="takhmeenAmount"
              label="Takhmeen amount"
              fullWidth
              required
              validate={[required(), minValue(1)]}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
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
