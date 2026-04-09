import { useCallback, useEffect, useState } from "react";
import { Title, useNotify } from "react-admin";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";

export default function YearlyNiyaazSettingsPage() {
  const notify = useNotify();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zabihatAmount, setZabihatAmount] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    httpClient(`${getApiUrl()}/yearlyNiyaazSettings`)
      .then(({ json }) => {
        const data = json as { rows?: { zabihatAmount?: number }[] };
        const r = data.rows?.[0];
        if (r) {
          setZabihatAmount(r.zabihatAmount ?? 0);
        }
      })
      .catch(() => notify("Could not load Yearly Niyaaz settings", { type: "error" }))
      .finally(() => setLoading(false));
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const save = () => {
    setSaving(true);
    httpClient(`${getApiUrl()}/yearlyNiyaazSettings`, {
      method: "PUT",
      body: JSON.stringify({ zabihatAmount: Number(zabihatAmount) }),
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
      <Title title="Yearly Niyaaz Settings" />
      <Box sx={{ p: 2, maxWidth: 500 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Zabihat Amount (per unit)"
              type="number"
              value={zabihatAmount}
              onChange={(e) => setZabihatAmount(Number(e.target.value))}
              fullWidth
              required
              slotProps={{ htmlInput: { min: 0 } }}
              helperText="Used to auto-calculate zabihat total = count × amount"
            />
          </Grid>
          <Grid size={12}>
            <Button variant="contained" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
