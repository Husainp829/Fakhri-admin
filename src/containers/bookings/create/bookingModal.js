/* eslint-disable no-console */
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useGetList } from "react-admin";
import { callApi } from "../../../dataprovider/miscApis";
import { fromGregorian } from "../../../utils/hijriDateUtils";
import { slotNameMap } from "../../../constants";

const init = {
  hallId: "",
  purpose: "",
  rent: 0,
  deposit: 0,
  date: "",
  slot: "",
  thaals: 0,
  withAC: true,
};

export default function HallBookingModal({ open, onClose, append, hallBookings }) {
  const [newHall, setNewHall] = useState(init);
  const [validationError, setValidationError] = useState("");

  // 🔑 Get halls list with React-Admin
  const { data: halls = [] } = useGetList("halls", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "name", order: "ASC" },
  });

  const { data: purposes = [] } = useGetList("bookingPurpose", {
    pagination: { page: 1, perPage: 100 },
    sort: { field: "id", order: "ASC" },
  });

  const handleFieldChange = (field, value) => {
    setNewHall((prev) => ({ ...prev, [field]: value }));
  };

  const isDateValid = () => {
    if (!newHall.date) return false;
    const selectedDate = new Date(newHall.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate > today;
  };

  const isFormValid = newHall.hallId && newHall.slot && newHall.date && isDateValid();
  const handleClose = () => {
    setNewHall(init);
    setValidationError("");
    onClose();
  };

  const handleAddHall = async () => {
    const hall = halls.find((h) => h.id === newHall.hallId);
    const duplicateExists = hallBookings.some(
      (hb) => hb.hallId === newHall.hallId && hb.date === newHall.date && hb.slot === newHall.slot
    );

    if (duplicateExists) {
      setValidationError("This hall is already added for the same date and slot.");
      return;
    }

    if (newHall.thaals > hall.thaalCapacity) {
      setValidationError("Number of thaals cannot be greater than thaal capacity.");
      return;
    }

    try {
      const bookings = await callApi(
        `hallBookings?hallId=${newHall.hallId}&date=${newHall.date}&slot=${newHall.slot}`,
        {},
        "GET"
      );

      if (bookings.data?.count > 0) {
        throw new Error("This hall is already booked for the selected slot and date.");
      }

      append(newHall);
      handleClose();
    } catch (err) {
      setValidationError("This hall is already booked for the selected slot and date.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Hall</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Hall</InputLabel>
          <Select
            label="Hall"
            value={newHall.hallId}
            onChange={(e) => {
              handleFieldChange("hallId", e.target.value);
            }}
          >
            {halls.map((hall) => (
              <MenuItem key={hall.id} value={hall.id}>
                {hall.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Purpose</InputLabel>
          <Select
            label="Purpose"
            value={newHall.purpose}
            disabled={!newHall.hallId}
            onChange={(e) => {
              const purpose = purposes.find((p) => p.id === e.target.value);
              handleFieldChange("purpose", purpose.id);
              handleFieldChange("perThaal", purpose.perThaal || 0);
              const hall = purpose.hallCharges.find((p) => p.hallId === newHall.hallId) || {};
              handleFieldChange("rent", hall.rent);
              handleFieldChange("deposit", hall.deposit);
              handleFieldChange("acCharges", hall.acCharges);
              handleFieldChange("kitchenCleaning", hall.kitchenCleaning);
              handleFieldChange("includeThaalCharges", hall.includeThaalCharges);
            }}
          >
            {purposes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Date"
          type="date"
          value={newHall.date}
          onChange={(e) => handleFieldChange("date", e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ mt: 2 }}
          helperText={newHall.date && fromGregorian(new Date(newHall.date))}
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Slot</InputLabel>
          <Select
            label="Slot"
            value={newHall.slot}
            onChange={(e) => handleFieldChange("slot", e.target.value)}
          >
            {Object.entries(slotNameMap).map(([val, key]) => (
              <MenuItem value={val} key={key}>
                {key}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Thaals"
          type="number"
          value={newHall.thaals}
          onChange={(e) => handleFieldChange("thaals", parseInt(e.target.value || 0, 10))}
          InputLabelProps={{ shrink: true }}
          fullWidth
          defaultValue={0}
          sx={{ mt: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={newHall.withAC}
              onChange={(e) => handleFieldChange("withAC", e.target.checked)}
              color="primary"
              fullWidth
              label="With AC"
            />
          }
          label="With AC"
          sx={{ mt: 2 }}
        />

        {!isDateValid() && newHall.date && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Date must be after today.
          </Typography>
        )}

        {validationError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {validationError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAddHall} disabled={!isFormValid}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
