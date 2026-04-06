import { useEffect, useMemo, useState } from "react";
import { SelectInput, required, useDataProvider } from "react-admin";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { formatFmbHijriPeriod, getHijriYear } from "@/utils/hijri-date-utils";

type TakhmeenYearSelectProps = {
  helperText?: string;
};

export function TakhmeenYearSelect(props: TakhmeenYearSelectProps) {
  const { helperText, ...rest } = props;
  const dataProvider = useDataProvider();
  const current = useMemo(() => getHijriYear(new Date()), []);
  const [minYear, setMinYear] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await dataProvider.getList("fmbTakhmeen", {
          pagination: { page: 1, perPage: 1 },
          sort: { field: "hijriYearStart", order: "ASC" },
          filter: {},
        });
        const first = Array.isArray(res?.data) ? res.data[0] : null;
        const y = first?.hijriYearStart ?? null;
        const n = y == null ? null : Number(y);
        if (!alive) return;
        setMinYear(Number.isFinite(n) ? n : null);
      } catch {
        if (!alive) return;
        setMinYear(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [dataProvider]);

  const choices = useMemo(() => {
    const start = minYear != null ? minYear : current;
    const end = current + 2;
    const years: number[] = [];
    for (let y = start; y <= end; y += 1) years.push(y);
    return years.map((y) => ({ id: y, name: formatFmbHijriPeriod(y, null) ?? "—" }));
  }, [minYear, current]);

  return (
    <Grid
      size={{
        xs: 12,
        sm: 6,
      }}
    >
      <Box sx={{ pt: 0.5 }}>
        <SelectInput
          source="hijriYearStart"
          label="Hijri period"
          choices={choices}
          fullWidth
          validate={[required()]}
          helperText={helperText ?? "Defaults to current period"}
          {...rest}
        />
      </Box>
    </Grid>
  );
}
