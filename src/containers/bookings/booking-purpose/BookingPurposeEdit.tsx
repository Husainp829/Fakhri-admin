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
import Grid from "@mui/material/Grid";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

export const BookingPurposeEdit = () => {
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
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 10,
                }}
              >
                <ReferenceInput source="hallId" reference="halls" label="Hall" required>
                  <SelectInput optionText={(record) => `${record.name} (${record.shortCode})`} />
                </ReferenceInput>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <NoArrowKeyNumberInput source="rent" label="Rent (₹)" defaultValue={0} />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <NoArrowKeyNumberInput source="deposit" label="Deposit (₹)" defaultValue={0} />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 2,
                }}
              >
                <NoArrowKeyNumberInput source="acCharges" label="AC Charges (₹)" defaultValue={0} />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 2,
                }}
              >
                <NoArrowKeyNumberInput
                  source="kitchenCleaning"
                  label="Kitchen Cleaning (₹)"
                  defaultValue={0}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 2,
                }}
              >
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
