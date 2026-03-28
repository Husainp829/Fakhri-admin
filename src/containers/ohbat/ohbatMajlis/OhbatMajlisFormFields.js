import React from "react";
import { AutocompleteInput, DateInput, ReferenceInput, SelectInput, TextInput } from "react-admin";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import OhbatITSLookup from "./OhbatITSLookup";

const typeChoices = [
  { id: "Jaman", name: "Jaman" },
  { id: "Food_packets", name: "Food packets" },
  { id: "Salawaat", name: "Salawaat" },
];

const slotChoices = [
  { id: "morning", name: "Morning" },
  { id: "afternoon", name: "Afternoon" },
  { id: "evening", name: "Evening" },
];

export function OhbatMajlisFormFields() {
  return (
    <Grid container spacing={2}>
      <Grid
        item
        size={{ xs: 12, md: 6 }}
        sx={{
          pr: { md: 2 },
          borderRight: { md: "1px solid" },
          borderColor: "divider",
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          Majlis & contacts
        </Typography>
        <OhbatITSLookup source="hostItsNo" label="Host ITS" />
        <TextInput source="hostName" label="Host name" fullWidth disabled helperText="Filled from ITS data when you search" />
        <SelectInput source="type" choices={typeChoices} fullWidth />
        <ReferenceInput source="sadaratId" reference="sadarats" perPage={100} allowEmpty>
          <AutocompleteInput
            optionText={(r) => (r?.itsNo ? `${r.itsNo} — ${r.name || ""}` : r?.name)}
            label="Sadarat (optional)"
            emptyText="— None —"
            fullWidth
            helperText="Sadarat ITS/reference is stored on the sadarat record, not looked up from itsdata."
          />
        </ReferenceInput>
        <ReferenceInput
          source="khidmatguzarItsNo"
          reference="itsdata"
          filter={{ forKhidmatguzarPicker: true }}
          allowEmpty
          perPage={50}
        >
          <AutocompleteInput
            optionText={(r) => `${r.ITS_ID} — ${r.Full_Name || ""}`}
            optionValue="ITS_ID"
            label="Khidmatguzar (optional)"
            helperText="Tolobatul Kulliyatil Mumineen only; validated on save"
            filterToQuery={(q) => ({ q: q || "", forKhidmatguzarPicker: true })}
            emptyText="— None —"
            debounce={300}
            fullWidth
          />
        </ReferenceInput>
        <DateInput source="date" label="Majlis date" fullWidth />
        <SelectInput source="slot" choices={slotChoices} label="Slot" fullWidth />
      </Grid>
      <Grid item size={{ xs: 12, md: 6 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          Venue & notes
        </Typography>
        <TextInput source="address" label="Address" fullWidth multiline minRows={2} />
        <TextInput source="mobileNo" label="Contact mobile" fullWidth />
        <TextInput source="notes" label="Notes" fullWidth multiline minRows={4} />
      </Grid>
    </Grid>
  );
}
