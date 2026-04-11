import { useCallback, useEffect, useState } from "react";
import { useNotify, useRecordContext, useRefresh, Button } from "react-admin";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import { getApiUrl } from "@/constants";
import httpClient from "@/dataprovider/http-client";

type AdminOption = { id: string; name?: string; email?: string };

export default function FmbDistributorPortalAdminTab() {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const distributorId = record?.id as string | undefined;

  const [adminId, setAdminId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<AdminOption[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const loadCandidates = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await httpClient(`${getApiUrl()}/fmbThaliDistributor/portal-admin-candidates`, {
        method: "GET",
      });
      const json = res.json as { rows?: AdminOption[] };
      setOptions(Array.isArray(json.rows) ? json.rows : []);
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Failed to load admin list", { type: "warning" });
      setOptions([]);
    } finally {
      setLoadingList(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    const id = record?.portalAdminId;
    setAdminId(typeof id === "string" ? id : "");
  }, [record?.portalAdminId]);

  const save = async () => {
    if (!distributorId) return;
    setSaving(true);
    try {
      await httpClient(`${getApiUrl()}/fmbThaliDistributor/${distributorId}/portal-admin`, {
        method: "PUT",
        body: JSON.stringify({ adminId: adminId || null }),
      });
      notify("Portal login link updated", { type: "success" });
      refresh();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Failed to update portal link", { type: "warning" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Create an Admin user with the &quot;fmbThaliDistribution.distributorPortal&quot; permission
        (or a wildcard that includes it), then select them here. They use the same login page and
        are redirected to the distributor portal.
      </Typography>
      {record?.portalAdminEmail ? (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Currently linked: <strong>{String(record.portalAdminName ?? "")}</strong> (
          {String(record.portalAdminEmail)})
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No portal login linked.
        </Typography>
      )}
      {loadingList ? (
        <CircularProgress size={24} sx={{ display: "block", mb: 2 }} />
      ) : (
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="portal-admin-select-label">Portal admin</InputLabel>
          <Select<string>
            labelId="portal-admin-select-label"
            label="Portal admin"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {options.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.name ?? a.email ?? a.id} {a.email ? `(${a.email})` : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Button
        label="Save portal link"
        onClick={() => void save()}
        disabled={saving || !distributorId}
      />
    </Box>
  );
}
