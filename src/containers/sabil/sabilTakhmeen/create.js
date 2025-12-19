import React from "react";
import dayjs from "dayjs";
import { TextInput, Create, SimpleForm, ReferenceInput } from "react-admin";
import Grid from "@mui/material/GridLegacy";
import { ITSInput } from "./common/itsInput";
import MonthInput from "../../../components/MonthInput";

export default (props) => {
  const optionRenderer = (choice) => `${choice.itsNo} - ${choice.sabilType}`;

  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const sabilId = searchParams.get("sabilId");
  const transform = (data) => ({
    sabilId: data.sabilId,
    takhmeenAmount: data.newTakhmeenAmount,
    startDate: dayjs(data.startDate).startOf("month"),
  });

  const takhmeenDefaultValues = () => ({ sabilId });
  return (
    <Create
      {...props}
      transform={transform}
      redirect={`/sabilData/${sabilId}/show/takhmeenHistory`}
    >
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={takhmeenDefaultValues}
      >
        <Grid container spacing={1}>
          <Grid item lg={6} xs={6}>
            <ReferenceInput source="sabilId" reference="sabilData" required>
              <ITSInput
                fullWidth
                label="ITS No."
                optionText={optionRenderer}
                shouldRenderSuggestions={(val) => val.trim().length === 8}
                noOptionsText="Enter valid ITS No."
              />
            </ReferenceInput>
            <TextInput source="sabilNo" fullWidth disabled />
            <TextInput
              source="previousTakhmeenAmount"
              fullWidth
              disabled
              label="Previous Takhmeen Amount"
            />
            <MonthInput source="startDate" fullWidth label="Start Date" />
          </Grid>
          <Grid item lg={6} xs={6}>
            <TextInput source="sabilType" fullWidth disabled />
            <TextInput source="name" label="Sabil Holder Name" fullWidth disabled />
            <TextInput source="newTakhmeenAmount" fullWidth label="New Takhmeen Amount" />
          </Grid>
        </Grid>
        <TextInput source="remarks" fullWidth />
      </SimpleForm>
    </Create>
  );
};
