import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Tabs,
  Tab,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import httpClient from "../../../dataprovider/httpClient";
import { getApiUrl } from "../../../constants";

// Capacity per booking type: QUARTER = 0.25, HALF = 0.5, FULL = 1 (used to sum slot usage).
const TYPE_MULTIPLIER = { QUARTER: 0.25, HALF: 0.5, FULL: 1 };

// Day status colors and legend (single source of truth).
const DAY_COLORS = {
  empty: "#ffcdd2",
  full: "#c8e6c9",
  notFull: "#fff8e1",
};

const LEGEND_ITEMS = [
  { color: DAY_COLORS.empty, label: "Empty" },
  { color: DAY_COLORS.full, label: "Full (niyaaz ≥1 e.g. 1 full / 2 half / 4 quarter + 1 iftari)" },
  { color: DAY_COLORS.notFull, label: "Not full" },
];

const getDayLabel = (day) => (day === 31 ? "EID Ul Fitr" : `Raat ${day}`);

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
 * - Niyaaz: total capacity >= 1 (any mix of QUARTER/HALF/FULL that sums to 1).
 * - Iftari: total capacity >= 1 (1 iftari).
 * Valid niyaaz examples: 1 full; 2 half; 4 quarter; 1 half + 2 quarter; etc.
 * Valid combinations: (niyaaz >= 1) + (iftari >= 1), e.g. 1 full + 1 iftari, 2 half + 1 iftari, 4 quarter + 1 iftari.
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

/** Returns day color, status label, and booked slots for calendar/table views. */
const getDayColor = (dayData) => {
  const slots = dayData.slots || [];
  const bookedSlots = slots.filter((s) => s.bookings.length > 0);
  const hasAnyBookings = bookedSlots.length > 0;
  const full = isDayFull(dayData);
  let paperBgcolor = DAY_COLORS.notFull;
  let statusLabel = "Not full";
  if (!hasAnyBookings) {
    paperBgcolor = DAY_COLORS.empty;
    statusLabel = "Empty";
  } else if (full) {
    paperBgcolor = DAY_COLORS.full;
    statusLabel = "Full";
  }
  return { paperBgcolor, statusLabel, bookedSlots };
};

const SlotCell = React.memo(({ day, slot, type, bookings, onEdit }) => {
  const count = bookings.length;
  const hasBookings = count > 0;
  const handleClick = () => hasBookings && onEdit(day, slot, type, bookings);

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
      onClick={handleClick}
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
});

const deleteBookingApi = (bookingId) =>
  httpClient(`${getApiUrl("niyaazBookedSlots")}/niyaazBookedSlots/${bookingId}`, {
    method: "DELETE",
  });

const BookingDetailsModal = ({ open, onClose, day, slot, type, bookings, onDeleteSuccess }) => {
  const notify = useNotify();

  const handleDelete = async (bookingId) => {
    try {
      await deleteBookingApi(bookingId);
      notify("Booking deleted successfully", { type: "success" });
      onClose();
      onDeleteSuccess?.();
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

const RaatBookingsModal = ({ open, onClose, day, dayData, onDeleteSuccess }) => {
  const notify = useNotify();

  const allBookings = useMemo(
    () =>
      (dayData?.slots || []).flatMap((slotData) =>
        (slotData.bookings || []).map((booking) => ({
          ...booking,
          slot: slotData.slot,
          slotType: slotData.type,
        })),
      ),
    [dayData?.slots],
  );

  const handleDelete = async (bookingId) => {
    try {
      await deleteBookingApi(bookingId);
      notify("Booking deleted successfully", { type: "success" });
      onClose();
      onDeleteSuccess?.();
    } catch (error) {
      notify("Error deleting booking", { type: "error" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>All Bookings - {getDayLabel(day)}</DialogTitle>
      <DialogContent>
        {allBookings.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Form No</TableCell>
                  <TableCell>HOF Name</TableCell>
                  <TableCell>Slot</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <Link to={`/niyaaz/${booking.niyaazId}/show`}>{booking.niyaazFormNo}</Link>
                    </TableCell>
                    <TableCell>{booking.niyaazHOFName}</TableCell>
                    <TableCell>
                      <Chip label={`${booking.slot} - ${booking.slotType}`} size="small" />
                    </TableCell>
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
          <Typography>No bookings found for this raat.</Typography>
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
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "table"
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedRaat, setSelectedRaat] = useState(null);
  const notify = useNotify();

  const loadCalendarData = useCallback(async () => {
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
  }, [currentEvent?.id, notify]);

  useEffect(() => {
    if (currentEvent?.id) loadCalendarData();
  }, [currentEvent?.id, loadCalendarData]);

  const weeks = useMemo(() => {
    const days = calendarData?.days ?? [];
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [calendarData?.days]);

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

  if (!calendarData) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Title title="Niyaaz Booked Slots Calendar" />
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5">Calendar - {currentEvent.name}</Typography>
        <Button variant="contained" onClick={loadCalendarData}>
          Refresh
        </Button>
      </Box>

      <Tabs value={viewMode} onChange={(_, v) => setViewMode(v)} sx={{ mb: 2 }}>
        <Tab label="Calendar" value="calendar" />
        <Tab label="Table" value="table" />
      </Tabs>

      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
          Legend:
        </Typography>
        {LEGEND_ITEMS.map(({ color, label }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: color }} />
            <Typography variant="body2">{label}</Typography>
          </Box>
        ))}
      </Box>

      {viewMode === "table" ? (
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>Day</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 100 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Slots (click to view bookings)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calendarData.days.map((dayData) => {
                const { paperBgcolor, statusLabel, bookedSlots } = getDayColor(dayData);
                return (
                  <TableRow key={dayData.day} sx={{ bgcolor: paperBgcolor }}>
                    <TableCell sx={{ fontWeight: 500 }}>{getDayLabel(dayData.day)}</TableCell>
                    <TableCell>{statusLabel}</TableCell>
                    <TableCell>
                      {bookedSlots.length > 0 ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {bookedSlots.map((slotData, idx) => (
                            <Chip
                              key={idx}
                              label={`${slotData.slot} ${slotData.type} (${slotData.bookings.length})`}
                              size="small"
                              onClick={() =>
                                setSelectedCell({
                                  day: dayData.day,
                                  slot: slotData.slot,
                                  type: slotData.type,
                                  bookings: slotData.bookings,
                                })
                              }
                              sx={{ cursor: "pointer" }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary" fontStyle="italic">
                          No Niyaaz Yet
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <>
          {weeks.map((week, weekIdx) => (
            <Card key={weekIdx} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={1}>
                  {week.map((dayData) => {
                    const { paperBgcolor, bookedSlots } = getDayColor(dayData);
                    return (
                      <Grid
                        item
                        size={{ xs: 12, sm: 6, md: 12 / 7 }}
                        key={dayData.day}
                        sx={{ display: "flex" }}
                      >
                        <Paper sx={{ p: 1, bgcolor: paperBgcolor, minHeight: 150, width: "100%" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 1,
                              fontWeight: "bold",
                              cursor: "pointer",
                              "&:hover": { textDecoration: "underline" },
                            }}
                            onClick={() => setSelectedRaat({ day: dayData.day, dayData })}
                          >
                            {getDayLabel(dayData.day)}
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
        </>
      )}

      {selectedCell && (
        <BookingDetailsModal
          open={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          day={selectedCell.day}
          slot={selectedCell.slot}
          type={selectedCell.type}
          bookings={selectedCell.bookings}
          onDeleteSuccess={loadCalendarData}
        />
      )}

      {selectedRaat && (
        <RaatBookingsModal
          open={!!selectedRaat}
          onClose={() => setSelectedRaat(null)}
          day={selectedRaat.day}
          dayData={selectedRaat.dayData}
          onDeleteSuccess={loadCalendarData}
        />
      )}
    </Box>
  );
}
