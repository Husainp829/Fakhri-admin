import React, { useEffect } from "react";
import {
  SimpleForm,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
  DateInput,
  TextInput,
  Toolbar,
  SaveButton,
  DeleteButton,
  FormDataConsumer,
  useGetOne,
  useGetList,
  required,
} from "react-admin";
import Grid from "@mui/material/Grid";
import dayjs, { type ConfigType } from "dayjs";
import { useFormContext, useWatch } from "react-hook-form";

const todayStr = () => dayjs().format("YYYY-MM-DD");

const validateStartNotPast = (value: unknown) => {
  if (!value) return undefined;
  if (
    dayjs(value as ConfigType)
      .startOf("day")
      .isBefore(dayjs().startOf("day"))
  ) {
    return "Start date cannot be in the past";
  }
  return undefined;
};

const validateEndNotPast = (value: unknown) => {
  if (!value) return undefined;
  if (
    dayjs(value as ConfigType)
      .startOf("day")
      .isBefore(dayjs().startOf("day"))
  ) {
    return "End date cannot be in the past";
  }
  return undefined;
};

const validateEndOnOrAfterStart = (value: unknown, allValues?: Record<string, unknown>) => {
  const start = allValues?.startDate;
  if (!value || start == null || start === "") return undefined;
  if (
    dayjs(value as ConfigType)
      .startOf("day")
      .isBefore(dayjs(start as ConfigType).startOf("day"))
  ) {
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

const ThaliInput = ({ isEdit }: { isEdit?: boolean }) => {
  const fmbId = useWatch({ name: "fmbId" });
  const { data, isLoading } = useGetOne(
    "fmbData",
    { id: fmbId },
    { enabled: !!fmbId, staleTime: 60_000 }
  );
  const thalis = Array.isArray(data?.thalis) ? data.thalis : [];
  const choices = thalis.map(
    (thali: {
      id?: string;
      thaliNo?: string;
      thaliType?: { name?: string };
      isActive?: boolean;
    }) => ({
      id: thali.id,
      name: `${thali.thaliNo}${thali?.thaliType?.name ? ` — ${thali.thaliType.name}` : ""}${thali.isActive ? "" : " (inactive)"}`,
    })
  );

  return (
    <SelectInput
      source="fmbThaliId"
      label="Thali"
      choices={choices}
      fullWidth
      required
      disabled={isEdit || !fmbId || isLoading}
      helperText={fmbId ? undefined : "Select an FMB first"}
    />
  );
};

const InferFmbFromThali = ({ isEdit }: { isEdit?: boolean }) => {
  const { setValue } = useFormContext();
  const fmbId = useWatch({ name: "fmbId" });
  const fmbThaliId = useWatch({ name: "fmbThaliId" });
  const { data = [], isLoading } = useGetList("fmbData", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "updatedAt", order: "DESC" },
    filter: {},
  });

  useEffect(() => {
    if (!isEdit || fmbId || !fmbThaliId || isLoading || !Array.isArray(data) || !data.length) {
      return;
    }
    const ownerFmb = data.find((row) =>
      Array.isArray(row?.thalis)
        ? row.thalis.some((thali: { id?: string }) => thali?.id === fmbThaliId)
        : false
    );
    if (ownerFmb?.id) {
      setValue("fmbId", ownerFmb.id, { shouldDirty: false, shouldTouch: false });
    }
  }, [data, fmbId, fmbThaliId, isEdit, isLoading, setValue]);

  return null;
};

export function SuspensionForm({
  isEdit,
  defaultFmbId,
  defaultFmbThaliId,
}: {
  isEdit?: boolean;
  defaultFmbId?: string;
  defaultFmbThaliId?: string;
}) {
  const minDateStr = todayStr();
  const createDefaults =
    !isEdit && (defaultFmbId || defaultFmbThaliId)
      ? {
          ...(defaultFmbId ? { fmbId: defaultFmbId } : {}),
          ...(defaultFmbThaliId ? { fmbThaliId: defaultFmbThaliId } : {}),
        }
      : undefined;

  return (
    <SimpleForm
      defaultValues={createDefaults}
      toolbar={isEdit ? <EditToolbar /> : <CreateToolbar />}
      warnWhenUnsavedChanges
      sx={{ maxWidth: 720 }}
    >
      <InferFmbFromThali isEdit={isEdit} />
      <Grid container spacing={1}>
        <Grid size={12}>
          <ReferenceInput source="fmbId" reference="fmbData" required label="FMB record">
            <AutocompleteInput
              optionText={(r) => `${r.fileNo ?? "—"} · ITS ${r.itsNo ?? "—"}`}
              fullWidth
              validate={[required()]}
              disabled={isEdit}
              debounce={300}
            />
          </ReferenceInput>
        </Grid>
        <Grid size={12}>
          <ThaliInput isEdit={isEdit} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <DateInput
            source="startDate"
            fullWidth
            required
            label="Start (inclusive)"
            inputProps={!isEdit ? { min: minDateStr } : undefined}
            validate={!isEdit ? validateStartNotPast : undefined}
          />
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
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
        <Grid size={12}>
          <TextInput source="remarks" fullWidth multiline minRows={2} label="Remarks" />
        </Grid>
      </Grid>
    </SimpleForm>
  );
}
