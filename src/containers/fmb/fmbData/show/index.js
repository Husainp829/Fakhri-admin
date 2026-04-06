import React, { useMemo, useState } from "react";
import {
  Button,
  EditButton,
  Show,
  TabbedShowLayout,
  TopToolbar,
  useNotify,
  useRedirect,
  useRefresh,
  useShowContext,
} from "react-admin";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { getApiUrl } from "@/constants";
import httpClient from "../../../../dataprovider/httpClient";

import TakhmeenHistory from "./takhmeenHistory";
import FamilyMembers from "./familyMembers";
import Receipt from "./receipts";
import BasicInfo from "./basicInfo";
import SuspensionsTab from "./suspensions";
import ContributionsTab from "./contributions";
import PeriodTotalsTab from "./periodTotals";

function MergeFmbDialog({ open, onClose, parentRecord }) {
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  const parentId = parentRecord?.id;

  const optionLabel = (r) => {
    const fileNo = r?.fileNo ?? "—";
    const its = r?.itsNo ?? "—";
    const name = r?.itsdata?.Full_Name ?? r?.name ?? "—";
    return `${fileNo} · ITS ${its} · ${name}`;
  };

  const isOptionEqualToValue = (option, value) => option?.id === value?.id;

  const disabledIds = useMemo(() => new Set([parentId].filter(Boolean)), [parentId]);

  const fetchOptions = async (q) => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await httpClient(
        `${getApiUrl()}/fmbData?search=${encodeURIComponent(q || "")}&limit=50&startAfter=0`,
        {
          method: "GET",
        }
      );
      const rows = Array.isArray(res?.json?.rows) ? res.json.rows : [];
      setOptions(rows.filter((r) => !disabledIds.has(r?.id)));
    } catch (e) {
      notify(e?.message || "Failed to load FMB records", { type: "warning" });
    } finally {
      setLoading(false);
    }
  };

  const doMerge = async () => {
    if (!parentId) return;
    const childIds = selected.map((r) => r.id).filter(Boolean);
    if (!childIds.length) {
      notify("Select at least one child record to merge", { type: "warning" });
      return;
    }
    try {
      setLoading(true);
      await httpClient(`${getApiUrl()}/fmbData/${parentId}/merge`, {
        method: "POST",
        body: JSON.stringify({ childIds }),
      });
      notify("Merged successfully", { type: "info" });
      onClose();
      // We're already on parent show; refresh it so moved thalis/amounts appear immediately.
      refresh();
      redirect(`/fmbData/${parentId}/show`);
    } catch (e) {
      notify(e?.message || "Merge failed", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Merge FMB records into this parent</DialogTitle>
      <DialogContent>
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          This will move thalis, takhmeen periods, contributions, receipts, and allocations into the
          parent record, then close the child records. It will fail if any thaliNo collides.
        </Alert>
        <Autocomplete
          multiple
          options={options}
          value={selected}
          loading={loading}
          filterSelectedOptions
          isOptionEqualToValue={isOptionEqualToValue}
          onChange={(_, v) => {
            // Defensive: ensure uniqueness by id even if options are re-fetched.
            const uniq = (v || []).reduce((acc, item) => {
              const id = item?.id;
              if (!id) return acc;
              if (acc.some((x) => x?.id === id)) return acc;
              acc.push(item);
              return acc;
            }, []);
            setSelected(uniq);
          }}
          getOptionLabel={optionLabel}
          filterOptions={(x) => x} // server-side search
          onOpen={() => fetchOptions("")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Child records to merge"
              placeholder="Search by file/ITS/name"
              onChange={(e) => {
                const v = e.target.value;
                fetchOptions(v);
              }}
              helperText="Select child records to merge into this record. Child records will be closed after merge."
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={doMerge} disabled={loading || !selected.length} variant="contained">
          Merge
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const FmbShowActions = () => {
  const redirect = useRedirect();
  const { record } = useShowContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const open = Boolean(anchorEl);
  const id = record?.id;
  const defaultThaliId =
    record?.thalis?.find((thali) => thali?.isActive)?.id || record?.thalis?.[0]?.id;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const go = (path) => {
    handleClose();
    redirect(path);
  };

  return (
    <TopToolbar>
      <EditButton />
      <Button
        id="fmb-show-more-actions"
        aria-controls={open ? "fmb-show-more-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<MoreVertIcon />}
        color="inherit"
      >
        More
      </Button>
      <Menu
        id="fmb-show-more-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "fmb-show-more-actions" }}
      >
        <MenuItem disabled={!id} onClick={() => go(`/fmbTakhmeen/create?fmbId=${id}`)}>
          New takhmeen
        </MenuItem>
        <MenuItem disabled={!id} onClick={() => go(`/fmbReceipt/create?fmbId=${id}`)}>
          Record receipt
        </MenuItem>
        <MenuItem disabled={!id} onClick={() => go(`/fmbContributions/create?fmbId=${id}`)}>
          Add contribution
        </MenuItem>
        <MenuItem
          disabled={!defaultThaliId}
          onClick={() => go(`/fmbThaliSuspension/create?fmbId=${id}&fmbThaliId=${defaultThaliId}`)}
        >
          Add thali suspension
        </MenuItem>
        <MenuItem
          disabled={!id}
          onClick={() => {
            handleClose();
            setMergeOpen(true);
          }}
        >
          Merge records
        </MenuItem>
      </Menu>
      <MergeFmbDialog open={mergeOpen} onClose={() => setMergeOpen(false)} parentRecord={record} />
    </TopToolbar>
  );
};

export default function FmbDataShow(props) {
  return (
    <Show {...props} actions={<FmbShowActions />}>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Information">
          <BasicInfo />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Family Members" path="family">
          <FamilyMembers />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Takhmeen History" path="takhmeenHistory">
          <TakhmeenHistory />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Receipts" path="receipts">
          <Receipt />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Contributions" path="contributions">
          <ContributionsTab />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Period totals" path="periodTotals">
          <PeriodTotalsTab />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Suspensions" path="suspensions">
          <SuspensionsTab />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}
