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
    Grid,
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import httpClient from "../../../../dataprovider/httpClient";
import { getApiUrl } from "../../../../constants";

const SLOTS = ["SEHORI", "IFTAARI", "NIYAAZ"];
const TYPES = ["QUARTER", "HALF", "FULL"];

const ExistingBookingsModal = ({ open, onClose, eventId, day, slot, onAddAnyway }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && eventId && day && slot) {
            setLoading(true);
            httpClient(
                `${getApiUrl("niyaazBookedSlots")}/niyaazBookedSlots/existing?eventId=${eventId}&day=${day}&slot=${slot}`
            )
                .then(({ json }) => {
                    setBookings(json.bookings || []);
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
                                        <TableRow key={booking.id}>
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

const SlotDaySelector = ({ onSelect, eventId }) => {
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleDayClick = (day) => {
        setSelectedDay(day);
    };

    const handleSlotClick = (slot) => {
        if (selectedDay) {
            setSelectedSlot(slot);
            // Check for existing bookings
            httpClient(
                `${getApiUrl("niyaazBookedSlots")}/niyaazBookedSlots/existing?eventId=${eventId}&day=${selectedDay}&slot=${slot}`
            )
                .then(({ json }) => {
                    if (json.bookings && json.bookings.length > 0) {
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
        onSelect(selectedDay, selectedSlot);
        setSelectedDay(null);
        setSelectedSlot(null);
        setShowModal(false);
    };

    // Create grid for 31 days (30 days of Ramadaan + 1st of Shawwal)
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const weeks = [];
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
                        <Grid container item xs={12} key={weekIdx} spacing={1}>
                            {week.map((day) => (
                                <Grid item xs key={day}>
                                    <Button
                                      variant={selectedDay === day ? "contained" : "outlined"}
                                      onClick={() => handleDayClick(day)}
                                      fullWidth
                                      size="small"
                                      sx={{ minWidth: 40 }}
                                    >
                                        {day === 31 ? "EID" : day}
                                    </Button>
                                </Grid>
                            ))}
                            {/* Fill remaining cells if week has less than 7 days */}
                            {week.length < 7 &&
                                Array.from({ length: 7 - week.length }).map((_, idx) => (
                                    <Grid item xs key={`empty-${idx}`} />
                                ))}
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {selectedDay && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Selected Raat: {selectedDay === 31 ? "EID Ul Fitr" : `Raat ${selectedDay}`} - Choose Slot
                    </Typography>
                    <Grid container spacing={1}>
                        {SLOTS.map((slot) => (
                            <Grid item xs={4} key={slot}>
                                <Button
                                  variant={selectedSlot === slot ? "contained" : "outlined"}
                                  onClick={() => handleSlotClick(slot)}
                                  fullWidth
                                  color={selectedSlot === slot ? "primary" : "default"}
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

export default function BookedSlotsInput() {
    const { setValue } = useFormContext();
    const [currentEvent] = useStore("currentEvent");
    const bookedSlots = useWatch({ name: "bookedSlots" }) || [];

    const handleAddSlot = (day, slot) => {
        const newSlot = {
            day,
            slot,
            type: "FULL", // Default to FULL
        };
        const updated = [...bookedSlots, newSlot];
        setValue("bookedSlots", updated, { shouldDirty: true, shouldTouch: true });
    };

    const handleRemoveSlot = (index) => {
        const updated = bookedSlots.filter((_, i) => i !== index);
        setValue("bookedSlots", updated, { shouldDirty: true, shouldTouch: true });
    };

    const handleTypeChange = (index, type) => {
        const updated = [...bookedSlots];
        updated[index].type = type;
        setValue("bookedSlots", updated, { shouldDirty: true, shouldTouch: true });
    };

    if (!currentEvent?.id) {
        return (
            <Alert severity="warning">Please select an event first to book slots.</Alert>
        );
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
                                              style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc" }}
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
