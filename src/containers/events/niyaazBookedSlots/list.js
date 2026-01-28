import React, { useState, useEffect } from "react";
import { useStore, useNotify, Title, Button, Link } from "react-admin";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import httpClient from "../../../dataprovider/httpClient";
import { getApiUrl } from "../../../constants";

// Capacity per booking type: QUARTER = 0.25, HALF = 0.5, FULL = 1 (used to sum slot usage).
const TYPE_MULTIPLIER = { QUARTER: 0.25, HALF: 0.5, FULL: 1 };

/**
 * Returns used capacity for a single slot (e.g. NIYAAZ_FULL, IFTAARI_HALF).
 * Uses API value when present, otherwise sums from bookings using TYPE_MULTIPLIER.
 */
const getSlotUsedCapacity = (slotData) => {
  if (slotData.usedCapacity != null) return slotData.usedCapacity;
  return (slotData.bookings || []).reduce((sum, b) => sum + (TYPE_MULTIPLIER[b.type] ?? 1), 0);
};

/**
 * A day is considered "full" only when BOTH conditions hold:
 * - Niyaaz: total capacity >= 1 (e.g. 1 full niyaaz or 2 half niyaaz).
 * - Iftari: total capacity >= 1 (1 iftari).
 * Valid combinations: 1 full niyaaz + 1 iftari, or 2 half niyaaz + 1 iftari.
 */
const isDayFull = (dayData) => {
  const slots = dayData.slots || [];
  const niyaazUsed = slots
    .filter((s) => s.slot === "NIYAAZ")
    .reduce((sum, s) => sum + getSlotUsedCapacity(s), 0);
  const iftariUsed = slots
    .filter((s) => s.slot === "IFTAARI")
    .reduce((sum, s) => sum + getSlotUsedCapacity(s), 0);
  return niyaazUsed >= 1 && iftariUsed >= 1;
};

const SlotCell = ({ day, slot, type, bookings, onEdit }) => {
  const count = bookings.length;
  const hasBookings = count > 0;

  return (
    <Box
      sx={{
        p: 0.5,
        minHeight: 60,
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        cursor: hasBookings ? "pointer" : "default",
        bgcolor: hasBookings ? "#e3f2fd" : "transparent",
        "&:hover": hasBookings ? { bgcolor: "#bbdefb" } : {},
      }}
      onClick={() => hasBookings && onEdit(day, slot, type, bookings)}
    >
      {hasBookings ? (
        <Box>
          <Typography variant="caption" display="block" sx={{ fontWeight: "bold" }}>
            {slot} - {type}
          </Typography>
          <Chip label={`${count} booking(s)`} size="small" color="primary" sx={{ mt: 0.5 }} />
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          {slot} - {type}
        </Typography>
      )}
    </Box>
  );
};

const BookingDetailsModal = ({ open, onClose, day, slot, type, bookings }) => {
  const notify = useNotify();

  const handleDelete = async (bookingId) => {
    try {
      await httpClient(`${getApiUrl("niyaazBookedSlots")}/niyaazBookedSlots/${bookingId}`, {
        method: "DELETE",
      });
      notify("Booking deleted successfully", { type: "success" });
      onClose();
      // Refresh the page data
      window.location.reload();
    } catch (error) {
      notify("Error deleting booking", { type: "error" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Bookings - Raat {day}, {slot} ({type})
      </DialogTitle>
      <DialogContent>
        {bookings.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Form No</TableCell>
                  <TableCell>HOF Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Link to={`/niyaaz/${booking.niyaazId}/show`}>{booking.niyaazFormNo}</Link>
                    </TableCell>
                    <TableCell>{booking.niyaazHOFName}</TableCell>
                    <TableCell>
                      <Chip label={booking.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(booking.id)}
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
        ) : (
          <Typography>No bookings found.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function NiyaazBookedSlotsList() {
  const [currentEvent] = useStore("currentEvent");
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const notify = useNotify();

  useEffect(() => {
    if (currentEvent?.id) {
      loadCalendarData();
    }
  }, [currentEvent]);

  const loadCalendarData = async () => {
    if (!currentEvent?.id) {
      notify("Please select an event first", { type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const { json } = await httpClient(
        `${getApiUrl("niyaazBookedSlots")}/niyaazBookedSlots/calendar?eventId=${currentEvent.id}`,
      );
      setCalendarData(json);
    } catch (error) {
      notify("Error loading calendar data", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!currentEvent) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Please select an event first.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading calendar...</Typography>
      </Box>
    );
  }

  if (!calendarData) {
    return null;
  }

  // Group all days by week (7 days per row) - 31 days (30 Ramadaan + 1st Shawwal)
  const weeks = [];
  for (let i = 0; i < calendarData.days.length; i += 7) {
    weeks.push(calendarData.days.slice(i, i + 7));
  }

  return (
    <Box sx={{ p: 3 }}>
      <Title title="Niyaaz Booked Slots Calendar" />
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5">Calendar - {currentEvent.name}</Typography>
        <Button variant="contained" onClick={loadCalendarData}>
          Refresh
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
          Legend:
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#ffcdd2" }} />
          <Typography variant="body2">Empty</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#c8e6c9" }} />
          <Typography variant="body2">Full (1 full/2 half niyaaz + 1 iftari)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#fff8e1" }} />
          <Typography variant="body2">Not full</Typography>
        </Box>
      </Box>

      {weeks.map((week, weekIdx) => (
        <Card key={weekIdx} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={1}>
              {week.map((dayData) => {
                // Only show slots that have at least one booking in the day column.
                const bookedSlots = dayData.slots.filter(
                  (slotData) => slotData.bookings.length > 0,
                );
                // Day color: Empty (red) | Full (green) | Not full (amber).
                // Empty = no bookings; Full = niyaaz >= 1 and iftari >= 1; else Not full.
                const hasAnyBookings = bookedSlots.length > 0;
                const isFull = isDayFull(dayData);
                let paperBgcolor = "#fff8e1"; // default: not full (amber)
                if (!hasAnyBookings) {
                  paperBgcolor = "#ffcdd2"; // empty (red)
                } else if (isFull) {
                  paperBgcolor = "#c8e6c9"; // full (green)
                }

                return (
                  <Grid
                    item
                    size={{ xs: 12, sm: 6, md: 12 / 7 }}
                    key={dayData.day}
                    sx={{ display: "flex" }}
                  >
                    <Paper sx={{ p: 1, bgcolor: paperBgcolor, minHeight: 150, width: "100%" }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                        {dayData.day === 31 ? "EID Ul Fitr" : `Raat ${dayData.day}`}
                      </Typography>
                      {bookedSlots.length > 0 ? (
                        <Grid container spacing={0.5}>
                          {bookedSlots.map((slotData, idx) => (
                            <Grid item size={{ xs: 12 }} key={idx}>
                              <SlotCell
                                day={dayData.day}
                                slot={slotData.slot}
                                type={slotData.type}
                                bookings={slotData.bookings}
                                onEdit={(day, slot, type, bookings) =>
                                  setSelectedCell({ day, slot, type, bookings })
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          No Niyaaz Yet
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
              {/* Fill remaining cells if week has less than 7 days */}
              {week.length < 7 &&
                Array.from({ length: 7 - week.length }).map((_, idx) => (
                  <Grid item size={{ xs: 12, sm: 6, md: 12 / 7 }} key={`empty-${idx}`} />
                ))}
            </Grid>
          </CardContent>
        </Card>
      ))}

      {selectedCell && (
        <BookingDetailsModal
          open={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          day={selectedCell.day}
          slot={selectedCell.slot}
          type={selectedCell.type}
          bookings={selectedCell.bookings}
        />
      )}
    </Box>
  );
}
