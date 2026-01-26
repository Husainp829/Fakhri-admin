import React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ArrayInput,
  SimpleFormIterator,
  ReferenceInput,
  SelectInput,
  BooleanInput,
  useNotify,
  useRedirect,
} from "react-admin";
import { Grid } from "@mui/material";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";

const BookingPurposeEdit = () => {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Edit
      mutationOptions={{
        onSuccess: (data) => {
          notify("Booking purpose updated successfully");
          redirect("show", "bookingPurpose", data.id);
        },
      }}
    >
      <SimpleForm>
        <TextInput source="id" label="Purpose ID" disabled fullWidth />
        <TextInput source="name" label="Name" fullWidth />
        <ArrayInput source="hallCharges" label="Hall Charges">
          <SimpleFormIterator>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6, md: 10 }}>
                <ReferenceInput source="hallId" reference="halls" label="Hall" required>
                  <SelectInput optionText={(record) => `${record.name} (${record.shortCode})`} />
                </ReferenceInput>
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <NoArrowKeyNumberInput source="rent" label="Rent (₹)" min={0} defaultValue={0} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
                <NoArrowKeyNumberInput source="deposit" label="Deposit (₹)" min={0} defaultValue={0} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 2 }}>
                <NoArrowKeyNumberInput source="acCharges" label="AC Charges (₹)" min={0} defaultValue={0} />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 2 }}>
                <NoArrowKeyNumberInput
                  source="kitchenCleaning"
                  label="Kitchen Cleaning (₹)"
                  min={0}
                  defaultValue={0}
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6, md: 2 }}>
                <BooleanInput source="includeThaalCharges" label="Include Thaal Charges" />
              </Grid>
            </Grid>
          </SimpleFormIterator>
        </ArrayInput>
      </SimpleForm>
    </Edit>
  );
};

export default BookingPurposeEdit;
