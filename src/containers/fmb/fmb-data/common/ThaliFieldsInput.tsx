import {
  ArrayInput,
  AutocompleteInput,
  BooleanInput,
  DateInput,
  ReferenceInput,
  SimpleFormIterator,
  TextInput,
  required,
} from "react-admin";
import Grid from "@mui/material/Grid";
import { validateThalis } from "./thali-map";

export { mapThaliRowForApi } from "./thali-map";

export function ThaliFieldsInput() {
  return (
    <ArrayInput
      source="thalis"
      label="Thalis"
      validate={validateThalis}
      defaultValue={[{ thaliNo: "", thaliTypeId: null, isActive: true }]}
    >
      <SimpleFormIterator
        disableReordering
        fullWidth
        sx={{
          "& .RaSimpleFormIterator-form": {
            width: "100%",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 1.5,
            my: 1,
            backgroundColor: "background.paper",
          },
        }}
      >
        <Grid container spacing={1} sx={{ width: "100%", alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <TextInput source="thaliNo" label="Thali number" validate={[required()]} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <ReferenceInput
              source="thaliTypeId"
              reference="fmbThaliType"
              perPage={100}
              label="Thali type"
            >
              <AutocompleteInput
                optionText={(r) => `${r.code} — ${r.name}`}
                fullWidth
                debounce={250}
                validate={[required()]}
              />
            </ReferenceInput>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <BooleanInput source="isActive" label="Active" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <DateInput
              source="startedAt"
              label="Service from"
              fullWidth
              helperText="First day on schedule (inclusive). Empty = no start limit."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DateInput
              source="deactivatedAt"
              label="Service through"
              fullWidth
              helperText="Last day on schedule (inclusive). Empty = ongoing."
            />
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <ReferenceInput
              source="deliveryScheduleProfileId"
              reference="fmbDeliveryScheduleProfile"
              perPage={100}
              label="Profile override"
            >
              <AutocompleteInput
                optionText={(r) => `${r.code} — ${r.name}`}
                fullWidth
                debounce={250}
                helperText="Optional - defaults to FMB record profile when omitted"
              />
            </ReferenceInput>
          </Grid>

          <Grid size={12}>
            <TextInput
              source="deliveryAddress"
              label="Delivery address"
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>
          <Grid size={12}>
            <TextInput
              source="deliveryMohallah"
              label="Delivery mohallah"
              fullWidth
              helperText="Usually prefilled from ITS directory (Jamaat); enter manually if ITS is not in directory."
            />
          </Grid>
        </Grid>
      </SimpleFormIterator>
    </ArrayInput>
  );
}
