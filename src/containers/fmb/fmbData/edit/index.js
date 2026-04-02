import React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  DateInput,
  AutocompleteInput,
  useDataProvider,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import NoArrowKeyNumberInput from "../../../../components/NoArrowKeyNumberInput";
import { ThaliFieldsInput, mapThaliRowForApi } from "../common/thaliFields";

const transform = (data) => {
  const next = { ...data };
  // The FMB "current takhmeen" is managed via the takhmeen module, not via FMB edit.
  // Ensure we never send takhmeen fields (or legacy aliases) to avoid DTO validation on empty strings.
  delete next.takhmeen;
  delete next.takhmeenAmount;
  delete next.hijriYearStart;
  delete next.fmbTakhmeenCurrent;

  if (Array.isArray(next.thalis)) {
    next.thalis = next.thalis
      .filter((thali) => thali?.thaliNo && String(thali.thaliNo).trim())
      .map((thali) => mapThaliRowForApi(thali, { isCreate: false }));
  }
  return next;
};

export default (props) => (
  <Edit {...props} transform={transform}>
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ItsNameDisplay />
              {/* keep underlying form fields */}
              <TextInput source="itsNo" sx={{ display: "none" }} />
              <TextInput source="name" sx={{ display: "none" }} />
            </Box>
            <Box sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
              <ChangeItsButton />
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <TextInput source="mobileNo" label="Mobile" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <TextInput source="pan" fullWidth />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <CurrentTakhmeenAmountInput />
        </Grid>
        <Grid item xs={12} sm={6} lg={6}>
          <DateInput source="lastPaidDate" label="Last paid date" fullWidth disabled />
        </Grid>
        <Grid item xs={12}>
          <TextInput source="remarks" label="Remarks" fullWidth minRows={3} multiline />
        </Grid>
        <Grid item xs={12}>
          <ReferenceInput
            source="deliveryScheduleProfileId"
            reference="fmbDeliveryScheduleProfile"
            perPage={100}
            label="Delivery schedule profile"
          >
            <AutocompleteInput
              optionText={(r) => `${r.code} — ${r.name}`}
              fullWidth
              required
              debounce={300}
            />
          </ReferenceInput>
        </Grid>
        <Grid item xs={12}>
          <ThaliFieldsInput />
        </Grid>
      </Grid>
    </SimpleForm>
  </Edit>
);

function CurrentTakhmeenAmountInput() {
  // react-admin exposes the current record values as form fields; use the field values directly.
  // (No hooks here to keep this component safe in any render context.)
  return (
    <NoArrowKeyNumberInput
      source="fmbTakhmeenCurrent.takhmeenAmount"
      label="Current Takhmeen"
      fullWidth
      disabled
      helperText={
        // react-admin doesn't support dynamic helperText via source binding; keep this stable.
        "To change takhmeen, use the Takhmeen section/module."
      }
    />
  );
}

function normalizeString(v) {
  if (v == null) return "";
  return String(v).trim();
}

function ChangeItsButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        variant="outlined"
        size="small"
        sx={{ mt: 0.5, whiteSpace: "nowrap" }}
        onClick={() => setOpen(true)}
      >
        Change
      </Button>
      {open && <ChangeItsDialog open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

function ChangeItsDialog({ open, onClose }) {
  const dataProvider = useDataProvider();
  const { setValue } = useFormContext();
  const currentItsNo = useWatch({ name: "itsNo" });
  const currentItsNoNorm = React.useMemo(() => normalizeString(currentItsNo), [currentItsNo]);

  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [family, setFamily] = React.useState([]);
  const [results, setResults] = React.useState([]);
  const [value, setDialogValue] = React.useState(null); // option or string

  const fetchFamily = React.useCallback(async () => {
    const itsNo = normalizeString(currentItsNo);
    if (!itsNo) return [];
    try {
      const its = (await dataProvider.getOne("itsData", { id: itsNo })).data;
      const hofId = its?.HOF_ID;
      if (!hofId) return [];
      const res = await dataProvider.getList("itsdata", {
        pagination: { page: 1, perPage: 50 },
        sort: { field: "Full_Name", order: "ASC" },
        filter: { HOF_ID: String(hofId) },
      });
      return Array.isArray(res?.data) ? res.data : [];
    } catch {
      return [];
    }
  }, [dataProvider, currentItsNo]);

  const fetchResults = React.useCallback(
    async (term) => {
      const q = normalizeString(term);
      if (!q) return [];
      try {
        const res = await dataProvider.getList("itsdata", {
          pagination: { page: 1, perPage: 25 },
          sort: { field: "Full_Name", order: "ASC" },
          filter: { q },
        });
        return Array.isArray(res?.data) ? res.data : [];
      } catch {
        return [];
      }
    },
    [dataProvider],
  );

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const fam = await fetchFamily();
      if (!alive) return;
      setFamily(fam);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [fetchFamily]);

  React.useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      (async () => {
        const rows = await fetchResults(query);
        if (!alive) return;
        setResults(rows);
      })();
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, fetchResults]);

  const options = React.useMemo(() => {
    const current = currentItsNoNorm;
    const famIds = new Set(
      (family || []).map((r) => String(r?.ITS_ID ?? "").trim()).filter(Boolean),
    );
    const dedup = (rows) => {
      const seen = new Set();
      return (rows || []).filter((r) => {
        const id = String(r?.ITS_ID ?? "").trim();
        if (!id || id === current || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    };

    const fam = dedup(family).map((r) => ({ ...r, group: "Family members" }));
    const rest = dedup(results)
      .filter((r) => !famIds.has(String(r?.ITS_ID ?? "").trim()))
      .map((r) => ({ ...r, group: "All ITS" }));
    return [...fam, ...rest];
  }, [family, results, currentItsNoNorm]);

  const getOptionLabel = (opt) => {
    if (typeof opt === "string") return opt;
    if (!opt) return "";
    const its = opt.ITS_ID ?? opt.id ?? "";
    const name = opt.Full_Name ?? "";
    const isHof = String(opt.HOF_FM_TYPE ?? "").toUpperCase() === "HOF";
    return `${its}${name ? ` · ${name}` : ""}${isHof ? " · HOF" : ""}`;
  };

  const applyIts = async (nextItsNo) => {
    const itsNo = normalizeString(nextItsNo);
    if (!itsNo || itsNo === currentItsNoNorm) return;

    setValue("itsNo", itsNo, { shouldDirty: true });
    try {
      const its = (await dataProvider.getOne("itsData", { id: itsNo })).data;
      if (its) {
        setValue("name", its.Full_Name ?? null, { shouldDirty: true });
        setValue("mobileNo", its.Mobile ?? null, { shouldDirty: true });
      }
    } catch {
      // keep ITS number even if lookup fails
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Change ITS</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Family members are shown first. You can also type any ITS number (free entry).
          </Typography>
          <Autocomplete
            freeSolo
            options={options}
            value={value}
            loading={loading}
            groupBy={(opt) => (typeof opt === "string" ? "All ITS" : opt.group || "All ITS")}
            getOptionLabel={getOptionLabel}
            renderOption={(props, option) => {
              if (typeof option === "string") {
                return (
                  <li {...props}>
                    <Typography variant="body2">{option}</Typography>
                  </li>
                );
              }
              const its = option.ITS_ID ?? option.id ?? "";
              const name = option.Full_Name ?? "";
              const isHof = String(option.HOF_FM_TYPE ?? "").toUpperCase() === "HOF";
              return (
                <li {...props}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 90 }}>
                      {its}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                      {name}
                    </Typography>
                    {isHof && <Chip size="small" color="primary" label="HOF" />}
                  </Stack>
                </li>
              );
            }}
            onChange={(_, newValue) => setDialogValue(newValue)}
            onInputChange={(_, newInputValue, reason) => {
              if (reason === "input") setQuery(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="ITS No. / Name"
                placeholder="Search ITS or enter manually"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => applyIts(typeof value === "string" ? value : value?.ITS_ID)}
          disabled={
            !normalizeString(typeof value === "string" ? value : value?.ITS_ID) ||
            normalizeString(typeof value === "string" ? value : value?.ITS_ID) === currentItsNoNorm
          }
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ItsNameDisplay() {
  const itsNo = useWatch({ name: "itsNo" });
  const name = useWatch({ name: "name" });
  const value = [normalizeString(itsNo), normalizeString(name)].filter(Boolean).join(" · ");
  return <TextField label="ITS · Name" value={value || ""} fullWidth disabled />;
}
