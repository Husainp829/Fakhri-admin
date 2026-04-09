import { useEffect, useState, useMemo, useCallback, type ComponentProps } from "react";
import { Create, SimpleForm, TextInput, SelectInput, required, useDataProvider } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import debounce from "lodash.debounce";

import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import { getHijriYear } from "@/utils/hijri-date-utils";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

type ItsLookupInputProps = ComponentProps<typeof TextInput>;

const ItsLookupInput = (props: ItsLookupInputProps) => {
  const { setValue } = useFormContext();
  const dataProvider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const itsNo = useWatch({ name: "itsNo" });

  const lookupItsData = useMemo(
    () =>
      debounce(async (itsNoValue: string) => {
        if (!itsNoValue || !itsNoValue.trim()) return;
        setLoading(true);
        try {
          const { data } = await dataProvider.getList("itsData", {
            filter: { ITS_ID: itsNoValue.trim() },
            pagination: { page: 1, perPage: 1 },
            sort: { field: "id", order: "ASC" },
          });
          if (data && data.length > 0) {
            const itsData = data[0] as { Full_Name?: string };
            setValue("name", itsData.Full_Name || "");
          } else {
            setValue("name", "");
          }
        } catch {
          console.error("Error looking up ITS data");
        } finally {
          setLoading(false);
        }
      }, 500),
    [dataProvider, setValue]
  );

  useEffect(() => {
    if (typeof itsNo === "string" && itsNo.trim().length === 8) {
      lookupItsData(itsNo);
    }
    return () => {
      lookupItsData.cancel();
    };
  }, [itsNo, lookupItsData]);

  return <TextInput {...props} disabled={loading} />;
};

const LiveSummary = ({ zabihatAmount }: { zabihatAmount: number }) => {
  const takhmeen = Number(useWatch({ name: "takhmeen" })) || 0;
  const zabihatCount = Number(useWatch({ name: "zabihatCount" })) || 0;
  const zabihatTotal = zabihatCount * zabihatAmount;
  const totalPayable = takhmeen + zabihatTotal;

  return (
    <Card variant="outlined" sx={{ mb: 2, bgcolor: "action.hover", width: "100%" }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 4 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              Takhmeen
            </Typography>
            <Typography variant="h6" fontWeight={600} noWrap>
              {fmt(takhmeen)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              Zabihat Total ({fmt(zabihatAmount)})
            </Typography>
            <Typography variant="h6" fontWeight={600} noWrap>
              {fmt(zabihatTotal)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              Total Payable
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main" noWrap>
              {fmt(totalPayable)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const YearlyNiyaazCreate = () => {
  const [zabihatAmount, setZabihatAmount] = useState(0);
  const currentHijriYear = useMemo(() => getHijriYear(new Date()), []);
  const defaultValues = useMemo(
    () => ({ hijriYear: String(currentHijriYear) }),
    [currentHijriYear]
  );
  const hijriYearChoices = useMemo(() => {
    const choices = [];
    for (let y = currentHijriYear - 10; y <= currentHijriYear + 10; y++) {
      choices.push({ id: String(y), name: String(y) });
    }
    return choices;
  }, [currentHijriYear]);

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
    itsNo: data.itsNo,
    name: data.name,
    hijriYear: data.hijriYear,
    takhmeen: Number(data.takhmeen) || 0,
    zabihatCount: Number(data.zabihatCount) || 0,
    zabihatTotal: Number(data.zabihatTotal) || 0,
  });

  return (
    <Create transform={transform} redirect="list">
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 1000 }} defaultValues={defaultValues}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Mumineen Details
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <ItsLookupInput source="itsNo" label="ITS No." fullWidth validate={required()} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <TextInput source="name" label="Full Name" fullWidth validate={required()} />
          </Grid>
        </Grid>

        <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
          Niyaaz Details
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SelectInput
              source="hijriYear"
              label="Hijri Year"
              choices={hijriYearChoices}
              fullWidth
              validate={required()}
            />
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
        </Grid>

        <LiveSummary zabihatAmount={zabihatAmount} />
      </SimpleForm>
    </Create>
  );
};

export default YearlyNiyaazCreate;
