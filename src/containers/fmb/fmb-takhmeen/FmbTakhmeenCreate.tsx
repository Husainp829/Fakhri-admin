import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  DateInput,
  required,
  minValue,
  type CreateProps,
} from "react-admin";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import { formatIsoDate } from "@/utils/date-format";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import { ITSInput } from "./common/FmbTakhmeenItsInput";
import { TakhmeenYearSelect } from "./common/TakhmeenYearSelect";
import { transformTakhmeenCreate } from "./common/takhmeen-form-transforms";
import { getHijriYear } from "@/utils/hijri-date-utils";

export default function FmbTakhmeenCreate(props: CreateProps) {
  const [searchParams] = useSearchParams();
  const prefFmbId = searchParams.get("fmbId") || "";

  const defaultValues = useMemo(() => {
    const startDate = formatIsoDate(dayjs().startOf("month"));
    const hijriYearStart = getHijriYear(new Date());
    return prefFmbId
      ? { fmbId: prefFmbId, startDate, hijriYearStart }
      : { startDate, hijriYearStart };
  }, [prefFmbId]);

  return (
    <Create
      {...props}
      transform={transformTakhmeenCreate}
      redirect={(resource, id, data) => {
        const fid = data?.fmbId || prefFmbId;
        return fid ? `/fmbData/${fid}/show/takhmeenHistory` : "list";
      }}
    >
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 720 }} defaultValues={defaultValues}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <ReferenceInput source="fmbId" reference="fmbData" perPage={100} required>
              <ITSInput
                label="FMB record"
                optionText={(r) => `${r.fileNo ?? "—"} · ITS ${r.itsNo ?? "—"} · ${r.name ?? "—"}`}
                fullWidth
                validate={[required()]}
                debounce={300}
                helperText={false}
              />
            </ReferenceInput>
          </Grid>
          <Grid size={12}>
            <TextInput source="name" label="Account name" fullWidth disabled helperText={false} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <TextInput
              source="previousTakhmeenAmount"
              label="Current takhmeen amount"
              fullWidth
              disabled
              helperText={false}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <NoArrowKeyNumberInput
              source="takhmeenAmount"
              label="New takhmeen amount"
              fullWidth
              helperText={false}
              validate={[required(), minValue(1)]}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
            }}
          >
            <DateInput
              source="startDate"
              label="Effective from (date)"
              helperText="Defaults to current date"
              fullWidth
              validate={[required()]}
            />
          </Grid>
          <TakhmeenYearSelect />
        </Grid>
      </SimpleForm>
    </Create>
  );
}
