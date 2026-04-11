import React from "react";
import {
  ArrayInput,
  AutocompleteInput,
  DateInput,
  ReferenceInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
} from "react-admin";
import Grid from "@mui/material/Grid";

import { FmbDishQuickCreateDialog } from "./FmbDishQuickCreateDialog";

function formatServiceDateForApi(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export type FmbDailyMenuFormPayload = {
  serviceDate: string;
  notes?: string | null;
  dishIds: string[];
};

export function transformFmbDailyMenuPayload(
  data: Record<string, unknown>
): FmbDailyMenuFormPayload {
  const lines = Array.isArray(data.menuLines) ? data.menuLines : [];
  const dishIds = lines
    .map((row: Record<string, unknown>) => String(row.dishId ?? "").trim())
    .filter(Boolean);

  return {
    serviceDate: formatServiceDateForApi(data.serviceDate),
    notes: data.notes === "" || data.notes == null ? null : String(data.notes).trim(),
    dishIds,
  };
}

const validateRequiredDate = (v: unknown) => (v == null || v === "" ? "Required" : undefined);

type FmbDailyMenuFormProps = Omit<React.ComponentProps<typeof SimpleForm>, "children">;

export function FmbDailyMenuForm(props: FmbDailyMenuFormProps) {
  return (
    <SimpleForm {...props} sx={{ maxWidth: 720 }}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DateInput
            source="serviceDate"
            label="Service date"
            fullWidth
            required
            validate={validateRequiredDate}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextInput source="notes" label="Notes" fullWidth multiline minRows={2} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ArrayInput source="menuLines" label="Dishes (order = serving order)">
            <SimpleFormIterator inline>
              <ReferenceInput
                source="dishId"
                reference="fmbDish"
                perPage={200}
                filterToQuery={(searchText: string) => ({ name: searchText ?? "" })}
              >
                <AutocompleteInput
                  optionText="name"
                  label="Dish"
                  size="small"
                  create={<FmbDishQuickCreateDialog />}
                  createItemLabel={(item) => `Add new dish: "${item}"`}
                  noOptionsText='Type a name, then pick "Add new dish: ..." if it is not in the list'
                />
              </ReferenceInput>
            </SimpleFormIterator>
          </ArrayInput>
        </Grid>
      </Grid>
    </SimpleForm>
  );
}
