import React from "react";
import {
  ArrayInput,
  AutocompleteInput,
  BooleanInput,
  DateInput,
  ReferenceInput,
  SimpleFormIterator,
  TextInput,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";

function toYmd(v) {
  if (v == null || v === "") {
    return null;
  }
  if (v instanceof Date) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "string") {
    return v.slice(0, 10);
  }
  return null;
}

/**
 * @param {object} thali
 * @param {{ isCreate?: boolean }} options — create omits empty dates so API defaults apply; edit sends null to clear bounds
 */
export function mapThaliRowForApi(thali, options = {}) {
  const isCreate = options.isCreate === true;
  const base = {
    id: thali?.id,
    thaliNo: String(thali.thaliNo).trim(),
    thaliTypeId: thali?.thaliTypeId || undefined,
    isActive: thali?.isActive !== false,
    deliveryScheduleProfileId: thali?.deliveryScheduleProfileId || undefined,
    useDefaultItsAddress: thali?.useDefaultItsAddress === true,
    deliveryAddress: thali?.deliveryAddress ? String(thali.deliveryAddress).trim() : undefined,
    deliveryMohallah: thali?.deliveryMohallah ? String(thali.deliveryMohallah).trim() : undefined,
  };
  if (isCreate) {
    const s = toYmd(thali?.startedAt);
    const e = toYmd(thali?.deactivatedAt);
    if (s) {
      base.startedAt = s;
    }
    if (e) {
      base.deactivatedAt = e;
    }
  } else {
    base.startedAt =
      thali?.startedAt == null || thali?.startedAt === "" ? null : toYmd(thali.startedAt);
    base.deactivatedAt =
      thali?.deactivatedAt == null || thali?.deactivatedAt === ""
        ? null
        : toYmd(thali.deactivatedAt);
  }
  return base;
}

const validateThalis = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return "Add at least one thali";
  }

  const hasInvalid = value.some((thali) => !thali?.thaliNo || !String(thali.thaliNo).trim());
  if (hasInvalid) {
    return "Each thali requires a thali number";
  }

  const activeCount = value.filter((thali) => thali?.isActive !== false).length;
  if (activeCount === 0) {
    return "Keep at least one active thali";
  }

  return undefined;
};

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
          // "& .RaSimpleFormIterator-line": { alignItems: "flex-start" },
        }}
      >
        <Grid container spacing={1} sx={{ width: "100%", alignItems: "center" }}>
          <Grid item xs={12} sm={6} md={5}>
            <TextInput source="thaliNo" label="Thali number" required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
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
                helperText={false}
              />
            </ReferenceInput>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <BooleanInput source="isActive" label="Active" />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DateInput
              source="startedAt"
              label="Service from"
              fullWidth
              helperText="First day on schedule (inclusive). Empty = no start limit."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DateInput
              source="deactivatedAt"
              label="Service through"
              fullWidth
              helperText="Last day on schedule (inclusive). Empty = ongoing."
            />
          </Grid>

          <Grid item xs={12} md={6}>
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
              />
            </ReferenceInput>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextInput source="deliveryMohallah" label="Delivery mohallah" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextInput
              source="deliveryAddress"
              label="Delivery address"
              fullWidth
              multiline
              minRows={3}
            />
          </Grid>
        </Grid>
      </SimpleFormIterator>
    </ArrayInput>
  );
}
