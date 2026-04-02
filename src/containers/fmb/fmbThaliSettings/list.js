import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Title, useNotify } from "react-admin";
import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezonePlugin from "dayjs/plugin/timezone";
import httpClient from "../../../dataprovider/httpClient";
import { getApiUrl } from "../../../constants";

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

/** ISO weekday 1 = Monday … 7 = Sunday (same as FMB profiles). */
const isoWeekday = (d) => {
  const day = d.day();
  return day === 0 ? 7 : day;
};

/** Next calendar day in `tz` that is `targetIso` (1–7), including today if it matches. */
function nextIsoWeekdayInTz(nowInTz, targetIso) {
  let d = nowInTz.startOf("day");
  for (let i = 0; i < 7; i += 1) {
    if (isoWeekday(d) === targetIso) {
      return d;
    }
    d = d.add(1, "day");
  }
  return nowInTz.startOf("day");
}

function formatInTz(instant, tz) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: tz,
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(instant.toDate());
}

/**
 * Live cut-off preview aligned with API `fmbSuspensionOrderCutoffInstant`.
 * Uses next Wednesday in the tenant zone as the sample service day.
 */
function computeCutoffPreview(tzRaw, offsetDaysRaw, cutoffMinutesRaw) {
  const tz = tzRaw?.trim() ?? "";
  if (!tz) {
    return { error: "Enter a timezone to see a live example." };
  }

  const offsetDays = Math.max(0, Number(offsetDaysRaw) || 0);
  const cutoffMinutes = Math.min(1439, Math.max(0, Number(cutoffMinutesRaw) || 0));

  let nowInTz;
  try {
    nowInTz = dayjs().tz(tz);
  } catch {
    return { error: "Timezone is not valid. Use an IANA name (e.g. Asia/Kolkata)." };
  }
  if (!nowInTz || !nowInTz.isValid()) {
    return { error: "Timezone is not valid. Use an IANA name (e.g. Asia/Kolkata)." };
  }

  const serviceDay = nextIsoWeekdayInTz(nowInTz, 3);
  const serviceCivil = serviceDay.format("YYYY-MM-DD");

  const cutoff = dayjs
    .tz(serviceCivil, tz)
    .subtract(offsetDays, "day")
    .startOf("day")
    .add(cutoffMinutes, "minute");

  if (!cutoff.isValid()) {
    return { error: "Could not compute cut-off for these values." };
  }

  const anchorMidnight = dayjs.tz(serviceCivil, tz).subtract(offsetDays, "day").startOf("day");

  return {
    serviceCivil,
    serviceDayFormatted: formatInTz(serviceDay, tz),
    cutoffFormatted: formatInTz(cutoff, tz),
    anchorDayFormatted: formatInTz(anchorMidnight, tz),
    offsetDays,
    cutoffMinutes,
    tz,
  };
}

/**
 * Singleton tenant settings: GET/PUT /fmbThaliSettings (no resource id).
 * Implemented here so the shared dataProvider stays free of resource-specific branches.
 */
export default function FmbThaliSettingsPage() {
  const notify = useNotify();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState("");
  const [defaultCutoffOffsetDays, setDefaultCutoffOffsetDays] = useState(0);
  const [defaultCutoffMinutes, setDefaultCutoffMinutes] = useState(0);
  const [zabihatUnitAmount, setZabihatUnitAmount] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    httpClient(`${getApiUrl()}/fmbThaliSettings`)
      .then(({ json: { rows } }) => {
        const r = rows?.[0];
        if (r) {
          setTimezone(r.timezone ?? "");
          setDefaultCutoffOffsetDays(r.defaultCutoffOffsetDays ?? 0);
          setDefaultCutoffMinutes(r.defaultCutoffMinutes ?? 0);
          setZabihatUnitAmount(r.zabihatUnitAmount ?? 0);
        }
      })
      .catch(() => notify("Could not load thali settings", { type: "error" }))
      .finally(() => setLoading(false));
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const cutoffPreview = useMemo(
    () => computeCutoffPreview(timezone, defaultCutoffOffsetDays, defaultCutoffMinutes),
    [timezone, defaultCutoffOffsetDays, defaultCutoffMinutes],
  );

  const save = () => {
    setSaving(true);
    httpClient(`${getApiUrl()}/fmbThaliSettings`, {
      method: "PUT",
      body: JSON.stringify({
        timezone: timezone.trim(),
        defaultCutoffOffsetDays: Number(defaultCutoffOffsetDays),
        defaultCutoffMinutes: Number(defaultCutoffMinutes),
        zabihatUnitAmount: Number(zabihatUnitAmount),
      }),
    })
      .then(() => notify("Saved", { type: "success" }))
      .catch(() => notify("Save failed", { type: "error" }))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <>
      <Title title="Thali settings" />
      <Box sx={{ p: 2, maxWidth: 720 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              fullWidth
              required
              helperText="IANA name, e.g. Asia/Kolkata"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Default cut-off offset (days before service day)"
              type="number"
              value={defaultCutoffOffsetDays}
              onChange={(e) => setDefaultCutoffOffsetDays(Number(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 0 }}
              helperText="0 = cut-off on the service day itself (after its midnight)"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Default cut-off (minutes after local midnight)"
              type="number"
              value={defaultCutoffMinutes}
              onChange={(e) => setDefaultCutoffMinutes(Number(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 0, max: 1439 }}
              helperText="0–1439 (e.g. 120 = 2:00 AM, 630 = 10:30 AM)"
            />
          </Grid>
          <Grid item xs={12}>
            <Alert severity="success" variant="outlined">
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Live example (updates as you type)
              </Typography>
              {cutoffPreview.error ? (
                <Typography variant="body2">{cutoffPreview.error}</Typography>
              ) : (
                <>
                  <Typography variant="body2" sx={{ mb: 0.75 }}>
                    Sample <strong>service day</strong> (next Wednesday in{" "}
                    <strong>{cutoffPreview.tz}</strong>):{" "}
                    <strong>{cutoffPreview.serviceDayFormatted}</strong>{" "}
                    <Box component="span" sx={{ typography: "caption", color: "text.secondary" }}>
                      ({cutoffPreview.serviceCivil})
                    </Box>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.75 }}>
                    With offset <strong>{cutoffPreview.offsetDays}</strong> day
                    {cutoffPreview.offsetDays === 1 ? "" : "s"} and{" "}
                    <strong>{cutoffPreview.cutoffMinutes}</strong> minutes, suspension cut-off is:{" "}
                    <strong>{cutoffPreview.cutoffFormatted}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    That is local midnight on <strong>{cutoffPreview.anchorDayFormatted}</strong>,
                    plus {cutoffPreview.cutoffMinutes} minutes — same rule as delivery profiles
                    using these defaults.
                  </Typography>
                </>
              )}
            </Alert>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Default zabihat unit amount"
              type="number"
              value={zabihatUnitAmount}
              onChange={(e) => setZabihatUnitAmount(Number(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 0 }}
              helperText="Used when creating ZABIHAT contributions without a unit amount override"
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
