import React, { useState, useEffect } from "react";
import {
    useStore,
    useNotify,
    Title,
    Button,
    Link,
} from "react-admin";
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
                Bookings - Day {day}, {slot} ({type})
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
                                            <Link to={`/niyaaz/${booking.niyaazId}/show`}>
                                                {booking.niyaazFormNo}
                                            </Link>
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
                `${getApiUrl("niyaazBookedSlots")}/niyaazBookedSlots/calendar?eventId=${currentEvent.id}`
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

            {weeks.map((week, weekIdx) => (
                <Card key={weekIdx} sx={{ mb: 2 }}>
                    <CardContent>
                        <Grid container spacing={1}>
                            {week.map((dayData) => {
                                // Filter slots to only show those with bookings
                                const bookedSlots = dayData.slots.filter(
                                    (slotData) => slotData.bookings.length > 0
                                );

                                return (
                                    <Grid item size={{ xs: 12, sm: 6, md: 12 / 7 }} key={dayData.day} sx={{ display: "flex" }}>
                                        <Paper sx={{ p: 1, bgcolor: "#f5f5f5", minHeight: 150, width: "100%" }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                                                {dayData.day === 31 ? "EID Ul Fitr" : `Day ${dayData.day}`}
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
                                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                    No bookings
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
