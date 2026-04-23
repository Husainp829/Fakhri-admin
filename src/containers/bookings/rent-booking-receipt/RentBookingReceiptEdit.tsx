import type { EditProps } from "react-admin";
import { Edit, SimpleForm, DateInput, TextInput, Toolbar, SaveButton } from "react-admin";
import Grid from "@mui/material/Grid";

const toIsoDatePayload = (value: unknown): string | undefined => {
  if (value == null || value === "") return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return undefined;
};

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

export const RentBookingReceiptEdit = (props: EditProps) => (
  <Edit
    {...props}
    mutationMode="pessimistic"
    redirect="list"
    transform={(data: Record<string, unknown>) => ({
      date: toIsoDatePayload(data.date),
    })}
  >
    <SimpleForm warnWhenUnsavedChanges toolbar={<EditToolbar />} sx={{ maxWidth: 700 }}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TextInput source="receiptNo" label="Receipt No" fullWidth disabled />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TextInput source="type" label="Type" fullWidth disabled />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TextInput source="organiserIts" label="ITS No" fullWidth disabled />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TextInput source="organiser" label="Organiser" fullWidth disabled />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TextInput source="amount" label="Amount" fullWidth disabled />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <TextInput source="mode" label="Mode" fullWidth disabled />
        </Grid>
        <Grid size={12}>
          <TextInput source="ref" label="Reference" fullWidth disabled />
        </Grid>
        <Grid size={12}>
          <DateInput source="date" label="Receipt date" fullWidth />
        </Grid>
      </Grid>
    </SimpleForm>
  </Edit>
);

export default RentBookingReceiptEdit;
