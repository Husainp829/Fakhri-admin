import React, { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useStore } from "react-admin";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Typography,
  Chip,
  IconButton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";
import type { CurrentEvent } from "@/containers/events/types";

const SLOTS = ["SEHORI", "IFTAARI", "NIYAAZ"] as const;
const TYPES = ["QUARTER", "HALF", "FULL"] as const;

type BookedSlotRow = { day: number; slot: string; type: string };

type ExistingBooking = {
  id: string | number;
  niyaazFormNo: string;
  niyaazHOFName: string;
  type: string;
};

function parseExistingBookingsJson(json: unknown): ExistingBooking[] {
  if (json == null || typeof json !== "object") return [];
  const b = (json as { bookings?: unknown }).bookings;
  if (!Array.isArray(b)) return [];
  return b.filter(
    (x): x is ExistingBooking =>
      x != null &&
      typeof x === "object" &&
      "id" in x &&
      "niyaazFormNo" in x &&
      "niyaazHOFName" in x &&
      "type" in x
  );
}

type ExistingBookingsModalProps = {
  open: boolean;
  onClose: () => void;
  eventId: string | number;
  day: number | null;
  slot: string | null;
  onAddAnyway: () => void;
};

const ExistingBookingsModal = ({
  open,
  onClose,
  eventId,
  day,
  slot,
  onAddAnyway,
}: ExistingBookingsModalProps) => {
  const [bookings, setBookings] = useState<ExistingBooking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && eventId && day != null && slot) {
      setLoading(true);
      httpClient(
        `${getApiUrl("niyaazBookedSlots")}/niyaazBookedSlots/existing?eventId=${eventId}&day=${day}&slot=${slot}`
      )
        .then(({ json }) => {
          setBookings(parseExistingBookingsJson(json));
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [open, eventId, day, slot]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Existing Bookings - {day === 31 ? "EID Ul Fitr" : `Raat ${day}`}, {slot}
      </DialogTitle>
      <DialogContent>
        {loading && <Typography>Loading...</Typography>}
        {!loading && bookings.length > 0 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              There are already {bookings.length} booking(s) for this slot. You can still add more.
            </Alert>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Form No</TableCell>
                    <TableCell>HOF Name</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={String(booking.id)}>
                      <TableCell>{booking.niyaazFormNo}</TableCell>
                      <TableCell>{booking.niyaazHOFName}</TableCell>
                      <TableCell>
                        <Chip label={booking.type} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        {!loading && bookings.length === 0 && (
          <Alert severity="success">No existing bookings for this slot.</Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onAddAnyway} variant="contained" color="primary">
          Add Anyway
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type SlotDaySelectorProps = {
  onSelect: (day: number, slot: string) => void;
  eventId: string | number;
};

const SlotDaySelector = ({ onSelect, eventId }: SlotDaySelectorProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSlotClick = (slot: string) => {
    if (selectedDay != null) {
      setSelectedSlot(slot);
      httpClient(
        `${getApiUrl("niyaazBookedSlots")}/niyaazBookedSlots/existing?eventId=${eventId}&day=${selectedDay}&slot=${slot}`
      )
        .then(({ json }) => {
          const list = parseExistingBookingsJson(json);
          if (list.length > 0) {
            setShowModal(true);
          } else {
            onSelect(selectedDay, slot);
            setSelectedDay(null);
            setSelectedSlot(null);
          }
        })
        .catch(() => {
          onSelect(selectedDay, slot);
          setSelectedDay(null);
          setSelectedSlot(null);
        });
    }
  };

  const handleAddAnyway = () => {
    if (selectedDay != null && selectedSlot) {
      onSelect(selectedDay, selectedSlot);
    }
    setSelectedDay(null);
    setSelectedSlot(null);
    setShowModal(false);
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weeks: number[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Select Raat (1-30 for Ramadaan) and Slot
        </Typography>
        <Grid container spacing={1}>
          {weeks.map((week, weekIdx) => (
            <Grid container key={weekIdx} spacing={1} size={12}>
              {week.map((day) => (
                <Grid key={day} size="grow">
                  <Button
                    variant={selectedDay === day ? "contained" : "outlined"}
                    onClick={() => setSelectedDay(day)}
                    fullWidth
                    size="small"
                    sx={{ minWidth: 40 }}
                  >
                    {day === 31 ? "EID" : day}
                  </Button>
                </Grid>
              ))}
              {week.length < 7 &&
                Array.from({ length: 7 - week.length }).map((_, idx) => (
                  <Grid key={`empty-${idx}`} size="grow" />
                ))}
            </Grid>
          ))}
        </Grid>
      </Box>
      {selectedDay != null && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Selected Raat: {selectedDay === 31 ? "EID Ul Fitr" : `Raat ${selectedDay}`} - Choose
            Slot
          </Typography>
          <Grid container spacing={1}>
            {SLOTS.map((slot) => (
              <Grid key={slot} size={4}>
                <Button
                  variant={selectedSlot === slot ? "contained" : "outlined"}
                  onClick={() => handleSlotClick(slot)}
                  fullWidth
                  color={selectedSlot === slot ? "primary" : "inherit"}
                >
                  {slot}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      <ExistingBookingsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        eventId={eventId}
        day={selectedDay}
        slot={selectedSlot}
        onAddAnyway={handleAddAnyway}
      />
    </>
  );
};

export default function NiyaazBookedSlotsInput() {
  const theme = useTheme();
  const { setValue } = useFormContext();
  const [currentEvent] = useStore<CurrentEvent | null>("currentEvent");
  const bookedSlots = (useWatch({ name: "bookedSlots" }) as BookedSlotRow[] | undefined) || [];

  const handleAddSlot = (day: number, slot: string) => {
    const newSlot: BookedSlotRow = {
      day,
      slot,
      type: "FULL",
    };
    const updated = [...bookedSlots, newSlot];
    setValue("bookedSlots", updated, { shouldDirty: true, shouldTouch: true });
  };

  const handleRemoveSlot = (index: number) => {
    const updated = bookedSlots.filter((_, i) => i !== index);
    setValue("bookedSlots", updated, { shouldDirty: true, shouldTouch: true });
  };

  const handleTypeChange = (index: number, type: string) => {
    const updated = [...bookedSlots];
    updated[index] = { ...updated[index], type };
    setValue("bookedSlots", updated, { shouldDirty: true, shouldTouch: true });
  };

  if (!currentEvent?.id) {
    return <Alert severity="warning">Please select an event first to book slots.</Alert>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Booked Slots (Ramadaan Days 1-30)
      </Typography>

      <SlotDaySelector onSelect={handleAddSlot} eventId={currentEvent.id} />

      {bookedSlots.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Selected Slots ({bookedSlots.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Raat</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookedSlots.map((slot, index) => (
                  <TableRow key={index}>
                    <TableCell>{slot.day === 31 ? "EID Ul Fitr" : `Raat ${slot.day}`}</TableCell>
                    <TableCell>
                      <Chip label={slot.slot} size="small" />
                    </TableCell>
                    <TableCell>
                      <select
                        value={slot.type}
                        onChange={(e) => handleTypeChange(index, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        {TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveSlot(index)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
