import { useRedirect } from "react-admin";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import { formatListDate } from "@/utils/date-format";
import type { HallBookingResource } from "./types";
import { slotLabel } from "./hallCalendarFormat";

function LabelValue({ label, value, grid }: { label: string; value: string; grid?: number }) {
  return (
    <Grid size={{ xs: 12, md: grid ?? 6 }}>
      <Typography fontWeight="bold">{label}</Typography>
      <Typography>{value}</Typography>
    </Grid>
  );
}

type HallBookingDetailsDialogProps = {
  open: boolean;
  onClose: () => void;
  selectedEvent: HallBookingResource | null;
};

export function HallBookingDetailsDialog({
  open,
  onClose,
  selectedEvent,
}: HallBookingDetailsDialogProps) {
  const redirect = useRedirect();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }} py={1}>
        <Typography variant="h6" alignSelf="center">
          Booking Details
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {selectedEvent && (
          <Box>
            <Grid container spacing={2}>
              <LabelValue
                label="Organiser"
                value={selectedEvent?.booking?.organiser || "N/A"}
                grid={12}
              />
              <LabelValue label="ITS No." value={selectedEvent?.booking?.itsNo || "N/A"} />
              <LabelValue label="phone" value={selectedEvent?.booking?.phone || "N/A"} />
              <LabelValue label="Purpose" value={selectedEvent?.purpose || "N/A"} grid={12} />
              <LabelValue label="Hall" value={selectedEvent?.hall?.name || "N/A"} grid={12} />
              <LabelValue
                label="Date"
                value={selectedEvent.date ? formatListDate(selectedEvent.date) : ""}
              />
              <LabelValue label="Slot" value={slotLabel(String(selectedEvent?.slot ?? ""))} />
              {selectedEvent.remarks ? (
                <LabelValue label="Remarks" value={String(selectedEvent.remarks)} grid={12} />
              ) : null}
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (selectedEvent?.bookingId) {
              redirect("show", "bookings", selectedEvent.bookingId);
            }
            onClose();
          }}
          variant="contained"
        >
          Show Booking
        </Button>
      </DialogActions>
    </Dialog>
  );
}
