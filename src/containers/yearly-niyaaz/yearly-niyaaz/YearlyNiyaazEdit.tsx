import { useCallback, useEffect, useState } from "react";
import { Edit, SimpleForm, TextInput, required } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";

const ZabihatTotalField = ({ zabihatAmount }: { zabihatAmount: number }) => {
  const { setValue } = useFormContext();
  const zabihatCount = useWatch({ name: "zabihatCount" });

  useEffect(() => {
    const count = Number(zabihatCount) || 0;
    setValue("zabihatTotal", count * zabihatAmount);
  }, [zabihatCount, zabihatAmount, setValue]);

  return (
    <NoArrowKeyNumberInput
      source="zabihatTotal"
      label="Zabihat Total"
      fullWidth
      disabled
      helperText={zabihatAmount ? `${zabihatAmount} × count` : "Set zabihat amount in settings"}
    />
  );
};

export const YearlyNiyaazEdit = () => {
  const [zabihatAmount, setZabihatAmount] = useState(0);

  const loadSettings = useCallback(() => {
    httpClient(`${getApiUrl()}/yearlyNiyaazSettings`)
      .then(({ json }) => {
        const data = json as { rows?: { zabihatAmount?: number }[] };
        const r = data.rows?.[0];
        if (r) setZabihatAmount(r.zabihatAmount ?? 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const transform = (data: Record<string, unknown>) => ({
    name: data.name,
    takhmeen: Number(data.takhmeen) || 0,
    zabihatCount: Number(data.zabihatCount) || 0,
    zabihatTotal: Number(data.zabihatTotal) || 0,
  });

  return (
    <Edit transform={transform} redirect="show" mutationMode="pessimistic">
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Mumineen Details
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <TextInput source="formNo" label="Form No" fullWidth disabled />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <TextInput source="itsNo" label="ITS No" fullWidth disabled />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <TextInput source="name" label="Full Name" fullWidth validate={required()} />
          </Grid>
        </Grid>

        <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
          Niyaaz Details
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <TextInput source="hijriYear" label="Hijri Year" fullWidth disabled />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <NoArrowKeyNumberInput
              source="takhmeen"
              label="Takhmeen"
              fullWidth
              validate={required()}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <NoArrowKeyNumberInput source="zabihatCount" label="Zabihat Count" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <ZabihatTotalField zabihatAmount={zabihatAmount} />
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  );
};

export default YearlyNiyaazEdit;
