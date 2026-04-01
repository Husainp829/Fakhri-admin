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
import { ITSInput } from "./common/itsInput";
import { TakhmeenYearSelect, transformTakhmeenCreate } from "./common/takhmeenFormShared";
import { getHijriYear } from "../../../utils/hijriDateUtils";

export default function FmbTakhmeenCreate(props) {
  const [searchParams] = useSearchParams();
  const prefFmbId = searchParams.get("fmbId") || "";

  const defaultValues = useMemo(() => {
    const startDate = dayjs().startOf("month").format("YYYY-MM-DD");
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
          <Grid item xs={12}>
            <ReferenceInput source="fmbId" reference="fmbData" perPage={100} required>
              <ITSInput
                label="FMB record"
                optionText={(r) => `${r.fileNo ?? "—"} · ITS ${r.itsNo ?? "—"} · ${r.name ?? "—"}`}
                fullWidth
                required
                debounce={300}
                helperText={false}
              />
            </ReferenceInput>
          </Grid>
          <Grid item xs={12}>
            <TextInput source="name" label="Account name" fullWidth disabled helperText={false} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput
              source="previousTakhmeenAmount"
              label="Current takhmeen amount"
              fullWidth
              disabled
              helperText={false}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NoArrowKeyNumberInput
              source="takhmeenAmount"
              label="New takhmeen amount"
              fullWidth
              helperText={false}
              validate={[required(), minValue(1)]}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
