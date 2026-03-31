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
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import dayjs from "dayjs";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";
import MonthInput from "../../../components/MonthInput";
import { ITSInput } from "./common/itsInput";
import { TakhmeenYearAutoSummary, transformTakhmeenCreate } from "./common/takhmeenFormShared";

export default function FmbTakhmeenCreate(props) {
  const [searchParams] = useSearchParams();
  const prefFmbId = searchParams.get("fmbId") || "";

  const defaultValues = useMemo(() => {
    const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
    return prefFmbId ? { fmbId: prefFmbId, startDate } : { startDate };
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
          <Grid item xs={12}>
            <ReferenceInput source="fmbId" reference="fmbData" perPage={100} required>
              <ITSInput
                label="FMB record"
                optionText={(r) => `${r.fmbNo ?? "—"} · ITS ${r.itsNo ?? "—"}`}
                fullWidth
                required
                debounce={300}
                filterToQuery={(q) => ({ search: q })}
              />
            </ReferenceInput>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput source="fmbNo" label="FMB number" fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput source="name" label="Account name" fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput
              source="previousTakhmeenAmount"
              label="Current takhmeen amount"
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NoArrowKeyNumberInput
              source="takhmeenAmount"
              label="New takhmeen amount"
              fullWidth
              required
              validate={[required(), minValue(1)]}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DateInput
              source="shawwalStartDate"
              label="1 Shawwal (Gregorian, optional)"
              fullWidth
              helperText="If set, Hijri year is taken from this date; else from effective month below"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MonthInput source="startDate" label="Effective from (month)" validate={[required()]} />
          </Grid>
          <TakhmeenYearAutoSummary />
        </Grid>
      </SimpleForm>
    </Create>
  );
}
