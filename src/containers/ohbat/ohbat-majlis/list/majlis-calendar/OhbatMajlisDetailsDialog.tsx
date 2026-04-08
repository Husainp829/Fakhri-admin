import { useNotify, useRedirect, type RaRecord } from "react-admin";
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
import dayjs from "dayjs";
import { buildOhbatMajlisEventDetailsText } from "../../OhbatMajlisEventDetailsClipboard";
import { formatMajlisStartTimeLabel } from "../../OhbatMajlisTime";

function LabelValue({ label, value, grid }: { label: string; value: string; grid?: number }) {
  return (
    <Grid size={{ xs: 12, md: grid ?? 6 }}>
      <Typography fontWeight="bold">{label}</Typography>
      <Typography>{value}</Typography>
    </Grid>
  );
}

type OhbatMajlisDetailsDialogProps = {
  open: boolean;
  onClose: () => void;
  selectedEvent: RaRecord | null;
};

export function OhbatMajlisDetailsDialog({
  open,
  onClose,
  selectedEvent,
}: OhbatMajlisDetailsDialogProps) {
  const notify = useNotify();
  const redirect = useRedirect();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }} py={1}>
        <Typography variant="h6" alignSelf="center">
          Ohbat Majlis
        </Typography>
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {selectedEvent && (
          <Box>
            <Grid container spacing={2}>
              <LabelValue label="Host ITS" value={String(selectedEvent?.hostItsNo ?? "—")} />
              <LabelValue label="Host name" value={String(selectedEvent?.hostName ?? "—")} />
              <LabelValue label="Sector" value={String(selectedEvent?.hostSector ?? "—")} />
              <LabelValue label="Sub-sector" value={String(selectedEvent?.hostSubSector ?? "—")} />
              <LabelValue label="Contact mobile" value={String(selectedEvent?.mobileNo ?? "—")} />
              <LabelValue label="Type" value={String(selectedEvent?.type ?? "—")} />
              <LabelValue
                label="Time"
                value={formatMajlisStartTimeLabel(selectedEvent?.startTime as string | undefined)}
              />
              <LabelValue
                label="Date"
                value={dayjs(selectedEvent.date as string).format("YYYY-MM-DD")}
              />
              <LabelValue
                label="Venue address"
                value={String(selectedEvent?.address ?? "—")}
                grid={12}
              />
              <LabelValue
                label="Sadarat"
                value={String(
                  (selectedEvent?.sadarat as { name?: string } | undefined)?.name ?? "—"
                )}
              />
              <LabelValue
                label="Sadarat mobile"
                value={String(
                  (selectedEvent?.sadarat as { mobile?: string } | undefined)?.mobile ?? "—"
                )}
              />
              <LabelValue
                label="Khidmatguzar name"
                value={String(
                  (selectedEvent?.khidmatguzar as { Full_Name?: string } | undefined)?.Full_Name ??
                    "—"
                )}
              />
              <LabelValue
                label="Khidmatguzar mobile"
                value={String(
                  (selectedEvent?.khidmatguzar as { Mobile?: string } | undefined)?.Mobile ?? "—"
                )}
              />
              <LabelValue
                label="Zakereen name"
                value={String(
                  (selectedEvent?.zakereen as { Full_Name?: string } | undefined)?.Full_Name ?? "—"
                )}
              />
              <LabelValue
                label="Zakereen mobile"
                value={String(
                  (selectedEvent?.zakereen as { Mobile?: string } | undefined)?.Mobile ?? "—"
                )}
              />
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={async () => {
            if (!selectedEvent) return;
            try {
              await navigator.clipboard.writeText(buildOhbatMajlisEventDetailsText(selectedEvent));
              notify("Event details copied to clipboard", { type: "success" });
            } catch {
              notify("Could not copy to clipboard", { type: "error" });
            }
          }}
          variant="outlined"
        >
          Copy details
        </Button>
        <Button
          onClick={() => {
            if (selectedEvent?.id == null) return;
            redirect("show", "ohbatMajalis", selectedEvent.id);
            onClose();
          }}
          variant="outlined"
        >
          Show
        </Button>
        <Button
          onClick={() => {
            if (selectedEvent?.id == null) return;
            redirect("edit", "ohbatMajalis", selectedEvent.id);
            onClose();
          }}
          variant="contained"
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
