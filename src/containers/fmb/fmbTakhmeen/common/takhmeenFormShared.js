import React, { useMemo } from "react";
import dayjs from "dayjs";
import { SelectInput, required, useDataProvider } from "react-admin";
import Box from "@mui/material/Box";
import Grid from "@mui/material/GridLegacy";
import { formatFmbHijriPeriod, getHijriYear } from "@/utils/hijri-date-utils";

export function transformTakhmeenCreate(data) {
  const hijriYearStart =
    data.hijriYearStart != null && data.hijriYearStart !== "" ? Number(data.hijriYearStart) : null;
  if (hijriYearStart == null || !Number.isFinite(hijriYearStart)) {
    throw new Error("Please select a Hijri period.");
  }
  const out = {
    fmbId: data.fmbId,
    takhmeenAmount: Number(data.takhmeenAmount),
    hijriYearStart,
    hijriYearEnd: hijriYearStart + 1,
    startDate: dayjs(data.startDate).startOf("month").toISOString(),
  };

  return out;
}

/** Update: omit fmbId (immutable); hijriYearStart is selected explicitly in the form. */
export function transformTakhmeenUpdate(data) {
  const hijriYearStart =
    data.hijriYearStart != null && data.hijriYearStart !== "" ? Number(data.hijriYearStart) : null;
  if (hijriYearStart == null || !Number.isFinite(hijriYearStart)) {
    throw new Error("Please select a Hijri period.");
  }
  const out = {
    takhmeenAmount: Number(data.takhmeenAmount),
    hijriYearStart,
    hijriYearEnd: hijriYearStart + 1,
    startDate: dayjs(data.startDate).startOf("month").toISOString(),
  };

  return out;
}

export function TakhmeenYearSelect(props) {
  const { helperText, ...rest } = props || {};
  const dataProvider = useDataProvider();
  const current = useMemo(() => getHijriYear(new Date()), []);
  const [minYear, setMinYear] = React.useState(null);

  React.useEffect(() => {
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
    const years = [];
    for (let y = start; y <= end; y += 1) years.push(y);
    return years.map((y) => ({ id: y, name: formatFmbHijriPeriod(y) }));
  }, [minYear, current]);
  return (
    <Grid item xs={12} sm={6}>
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
