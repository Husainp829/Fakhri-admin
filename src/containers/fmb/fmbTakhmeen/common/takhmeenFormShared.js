import React, { useMemo } from "react";
import dayjs from "dayjs";
import { useWatch } from "react-hook-form";
import Box from "@mui/material/Box";
import Grid from "@mui/material/GridLegacy";
import Typography from "@mui/material/Typography";
import { formatFmbHijriPeriod, getHijriYear } from "../../../../utils/hijriDateUtils";

export const CATEGORY_CHOICES = [
  { id: "THALI", name: "Thali" },
  { id: "ZABIHAT", name: "Zabihat" },
];

export function resolveTakhmeenYear(startDate, shawwalStartDate) {
  const sw = shawwalStartDate != null && shawwalStartDate !== "" ? dayjs(shawwalStartDate) : null;
  if (sw?.isValid()) {
    return getHijriYear(sw.toDate());
  }
  const sd = startDate != null && startDate !== "" ? dayjs(startDate) : null;
  if (sd?.isValid()) {
    return getHijriYear(sd.startOf("month").toDate());
  }
  return null;
}

export function transformTakhmeenCreate(data) {
  const takhmeenYear = resolveTakhmeenYear(data.startDate, data.shawwalStartDate);
  if (takhmeenYear == null || !Number.isFinite(takhmeenYear)) {
    throw new Error("Could not derive Hijri takhmeen year from the dates entered.");
  }
  const out = {
    fmbId: data.fmbId,
    takhmeenAmount: Number(data.takhmeenAmount),
    takhmeenYear,
    startDate: dayjs(data.startDate).startOf("month").toISOString(),
  };

  if (data.category) {
    out.category = data.category;
  }
  if (data.shawwalStartDate) {
    const d = dayjs(data.shawwalStartDate);
    if (d.isValid()) {
      out.shawwalStartDate = d.format("YYYY-MM-DD");
    }
  }

  return out;
}

/** Update: always send shawwal as YYYY-MM-DD or null so cleared dates persist. Omit fmbId (immutable). */
export function transformTakhmeenUpdate(data) {
  const takhmeenYear = resolveTakhmeenYear(data.startDate, data.shawwalStartDate);
  if (takhmeenYear == null || !Number.isFinite(takhmeenYear)) {
    throw new Error("Could not derive Hijri takhmeen year from the dates entered.");
  }
  const out = {
    takhmeenAmount: Number(data.takhmeenAmount),
    takhmeenYear,
    startDate: dayjs(data.startDate).startOf("month").toISOString(),
    category: data.category,
  };

  if (data.shawwalStartDate) {
    const d = dayjs(data.shawwalStartDate);
    out.shawwalStartDate = d.isValid() ? d.format("YYYY-MM-DD") : null;
  } else {
    out.shawwalStartDate = null;
  }

  return out;
}

export function TakhmeenYearAutoSummary() {
  const startDate = useWatch({ name: "startDate" });
  const shawwalStartDate = useWatch({ name: "shawwalStartDate" });
  const takhmeenYear = useMemo(
    () => resolveTakhmeenYear(startDate, shawwalStartDate),
    [startDate, shawwalStartDate],
  );

  return (
    <Grid item xs={12} sm={6}>
      <Box sx={{ pt: 0.5 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Hijri period (auto)
        </Typography>
        <Typography variant="body1" component="p">
          {takhmeenYear != null ? formatFmbHijriPeriod(takhmeenYear) : "—"}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          Uses 1 Shawwal (Gregorian) when set; otherwise the tabular Hijri calendar year of the
          effective month.
        </Typography>
      </Box>
    </Grid>
  );
}
