import React, { useEffect, useState } from "react";
import { useCreateSuggestionContext, useDataProvider, useNotify, type RaRecord } from "react-admin";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const DIETARY_OPTIONS = [
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "NON_VEGETARIAN", label: "Non-vegetarian" },
] as const;

/**
 * Shown when the user picks “add new dish” from the daily-menu dish Autocomplete (react-admin create flow).
 */
export function FmbDishQuickCreateDialog() {
  const { filter, onCancel, onCreate } = useCreateSuggestionContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const [name, setName] = useState(() => (filter ?? "").trim());
  const [dietaryType, setDietaryType] =
    useState<(typeof DIETARY_OPTIONS)[number]["value"]>("VEGETARIAN");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setName((filter ?? "").trim());
    setLocalError(null);
  }, [filter]);

  const handleClose = () => {
    if (!saving) {
      onCancel();
    }
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("Name is required");
      return;
    }
    setLocalError(null);
    setSaving(true);
    try {
      const { data } = await dataProvider.create("fmbDish", {
        data: {
          name: trimmed,
          dietaryType,
          description: null,
          imageUrl: null,
          sortOrder: 0,
        },
      });
      const row = data as RaRecord;
      if (row?.id) {
        notify("Dish created", { type: "success" });
        onCreate(row);
      } else {
        notify("Invalid response from server", { type: "error" });
        onCancel();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not create dish";
      notify(message, { type: "error" });
      setLocalError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown={saving}
      aria-labelledby="fmb-dish-quick-create-title"
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle id="fmb-dish-quick-create-title">New dish</DialogTitle>
      <DialogContent
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(2),
          pt: 1,
        })}
      >
        <Typography variant="body2" color="text.secondary">
          Create this dish and add it to the menu. Cancel to keep editing the menu without saving a
          new dish.
        </Typography>
        <TextField
          autoFocus
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          disabled={saving}
          error={Boolean(localError) && !name.trim()}
        />
        <FormControl fullWidth disabled={saving}>
          <InputLabel id="fmb-dish-quick-dietary-label">Dietary type</InputLabel>
          <Select
            labelId="fmb-dish-quick-dietary-label"
            label="Dietary type"
            value={dietaryType}
            onChange={(e) =>
              setDietaryType(e.target.value as (typeof DIETARY_OPTIONS)[number]["value"])
            }
          >
            {DIETARY_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {localError ? (
          <Typography variant="body2" color="error">
            {localError}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button type="button" onClick={handleClose} disabled={saving} color="inherit">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          variant="contained"
          color="primary"
        >
          Create dish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
