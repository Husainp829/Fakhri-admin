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
} from "@mui/material";
import { useGetList } from "react-admin";
import { callApi } from "../../../dataprovider/miscApis";
import { fromGregorian } from "../../../hijriDateUtils";

const init = {
  hallId: "",
  rent: 0,
  deposit: 0,
  date: "",
  slot: "",
  thaals: 0,
};

export default function HallBookingModal({ open, onClose, append, hallBookings }) {
  const [newHall, setNewHall] = useState(init);
  const [validationError, setValidationError] = useState("");

  // 🔑 Get halls list with React-Admin
  const { data: halls = [] } = useGetList("halls");

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
              const hall = halls.find((h) => h.id === e.target.value);
              handleFieldChange("hallId", hall.id);
              handleFieldChange("rent", hall.rent);
              handleFieldChange("deposit", hall.deposit);
            }}
          >
            {halls.map((hall) => (
              <MenuItem key={hall.id} value={hall.id}>
                {hall.name}
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
            <MenuItem value="morning">Morning</MenuItem>
            <MenuItem value="afternoon">Afternoon</MenuItem>
            <MenuItem value="evening">Evening</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Thaals"
          type="number"
          value={newHall.thaals}
          onChange={(e) => handleFieldChange("thaals", e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          defaultValue={0}
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
