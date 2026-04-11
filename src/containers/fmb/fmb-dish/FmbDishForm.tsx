import React from "react";
import { NumberInput, SelectInput, SimpleForm, TextInput } from "react-admin";
import Grid from "@mui/material/Grid";

const DIETARY_CHOICES = [
  { id: "VEGETARIAN", name: "Vegetarian" },
  { id: "NON_VEGETARIAN", name: "Non-vegetarian" },
];

const validateRequired = (v: unknown) =>
  v == null || String(v).trim() === "" ? "Required" : undefined;

export type FmbDishFormPayload = {
  name: string;
  dietaryType: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
};

export function transformFmbDishPayload(data: Record<string, unknown>): FmbDishFormPayload {
  return {
    name: String(data.name ?? "").trim(),
    dietaryType: String(data.dietaryType ?? ""),
    description:
      data.description === "" || data.description == null ? null : String(data.description).trim(),
    imageUrl: data.imageUrl === "" || data.imageUrl == null ? null : String(data.imageUrl).trim(),
    sortOrder: data.sortOrder != null ? Number(data.sortOrder) : 0,
  };
}

type FmbDishFormProps = Omit<React.ComponentProps<typeof SimpleForm>, "children">;

export function FmbDishForm(props: FmbDishFormProps) {
  return (
    <SimpleForm {...props} sx={{ maxWidth: 720 }}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextInput source="name" label="Name" fullWidth required validate={validateRequired} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <NumberInput source="sortOrder" label="Sort order" fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SelectInput
            source="dietaryType"
            label="Dietary type"
            choices={DIETARY_CHOICES}
            fullWidth
            required
            validate={validateRequired}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextInput source="description" label="Description" fullWidth multiline minRows={2} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextInput source="imageUrl" label="Image URL" fullWidth />
        </Grid>
      </Grid>
    </SimpleForm>
  );
}
