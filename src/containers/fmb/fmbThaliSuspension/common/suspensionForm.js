import React from "react";
import {
  SimpleForm,
  ReferenceInput,
  AutocompleteInput,
  DateInput,
  TextInput,
  Toolbar,
  SaveButton,
  DeleteButton,
  FormDataConsumer,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import dayjs from "dayjs";

const todayStr = () => dayjs().format("YYYY-MM-DD");

const validateStartNotPast = (value) => {
  if (!value) return undefined;
  if (dayjs(value).startOf("day").isBefore(dayjs().startOf("day"))) {
    return "Start date cannot be in the past";
  }
  return undefined;
};

const validateEndNotPast = (value) => {
  if (!value) return undefined;
  if (dayjs(value).startOf("day").isBefore(dayjs().startOf("day"))) {
    return "End date cannot be in the past";
  }
  return undefined;
};

const validateEndOnOrAfterStart = (value, allValues) => {
  if (!value || !allValues?.startDate) return undefined;
  if (dayjs(value).startOf("day").isBefore(dayjs(allValues.startDate).startOf("day"))) {
    return "End date must be on or after start date";
  }
  return undefined;
};

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
    <DeleteButton mutationMode="pessimistic" confirmTitle="Resume thali (delete suspension)?" />
  </Toolbar>
);

const CreateToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

export function SuspensionForm({ isEdit, defaultFmbId }) {
  const minDateStr = todayStr();

  return (
    <SimpleForm
      defaultValues={!isEdit && defaultFmbId ? { fmbId: defaultFmbId } : undefined}
      toolbar={isEdit ? <EditToolbar /> : <CreateToolbar />}
      warnWhenUnsavedChanges
      sx={{ maxWidth: 720 }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ReferenceInput source="fmbId" reference="fmbData" required label="FMB record">
            <AutocompleteInput
              optionText="fmbNo"
              fullWidth
              required
              disabled={isEdit}
              debounce={300}
            />
          </ReferenceInput>
        </Grid>
        <Grid item xs={12} sm={6}>
          <DateInput
            source="startDate"
            fullWidth
            required
            label="Start (inclusive)"
            inputProps={!isEdit ? { min: minDateStr } : undefined}
            validate={!isEdit ? validateStartNotPast : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormDataConsumer>
            {({ formData }) => {
              const start = formData?.startDate;
              let endMin;
              if (!isEdit) {
                const t0 = dayjs().startOf("day");
                const s0 = start ? dayjs(start).startOf("day") : t0;
                endMin = s0.isAfter(t0) ? s0.format("YYYY-MM-DD") : minDateStr;
              }
              return (
                <DateInput
                  source="endDate"
                  fullWidth
                  required
                  label="End (inclusive)"
                  inputProps={endMin ? { min: endMin } : undefined}
                  validate={
                    isEdit
                      ? validateEndOnOrAfterStart
                      : [validateEndNotPast, validateEndOnOrAfterStart]
                  }
                />
              );
            }}
          </FormDataConsumer>
        </Grid>
        <Grid item xs={12}>
          <TextInput source="remarks" fullWidth multiline minRows={2} label="Remarks" />
        </Grid>
      </Grid>
    </SimpleForm>
  );
}
