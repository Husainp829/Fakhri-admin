import type { ReactNode } from "react";
import { useNotify, usePermissions, useRecordContext, type RaRecord } from "react-admin";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import { formatListDate } from "@/utils/date-format";
import { hasPermission } from "@/utils/permission-utils";
import {
  openOhbatMajlisKhidmatDialog,
  openOhbatMajlisSadaratDialog,
  openOhbatMajlisZakereenDialog,
} from "./OhbatMajlisShowDialogOpeners";
import { buildOhbatMajlisEventDetailsText } from "./OhbatMajlisEventDetailsClipboard";
import { formatMajlisStartTimeLabel } from "./OhbatMajlisTime";

const dash = (v: unknown) => (v != null && String(v).trim() !== "" ? String(v) : "—");

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <Typography
      component="div"
      sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.5 }}
    >
      <span>{label}:</span>
      <strong style={{ textAlign: "right", wordBreak: "break-word" }}>{value}</strong>
    </Typography>
  );
}

function SummaryTable({
  title,
  titleAddon,
  children,
}: {
  title: string;
  titleAddon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
          mb: 1,
        }}
      >
        <Typography variant="h6" component="h3" sx={{ m: 0 }}>
          {title}
        </Typography>
        {titleAddon}
      </Box>
      <Table size="small" aria-label={title} sx={{ borderTop: 1, borderTopColor: "divider" }}>
        <TableBody>{children}</TableBody>
      </Table>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <TableRow>
      <TableCell sx={{ py: 1, verticalAlign: "top", borderColor: "divider" }}>
        <LabelValue label={label} value={value} />
      </TableCell>
    </TableRow>
  );
}

/**
 * Compact two-column summary (hall booking–style) for ohbat majlis show.
 */
export function OhbatMajlisDetailsTab() {
  const record = useRecordContext() as RaRecord | undefined;
  const notify = useNotify();
  const { permissions } = usePermissions();
  const canEditMajlis = hasPermission(permissions, "ohbatMajalis.edit");

  if (!record) {
    return null;
  }

  const timeLabel = formatMajlisStartTimeLabel(record.startTime as string | undefined);
  const dateLabel = record.date ? formatListDate(String(record.date)) : "—";

  const khidmatguzar = record.khidmatguzar as { ITS_ID?: string } | undefined;
  const khidmatIts = khidmatguzar?.ITS_ID ?? (record.khidmatguzarItsNo as string | undefined);
  const zakereenRow = record.zakereen as { ITS_ID?: string } | undefined;
  const zakereenIts = zakereenRow?.ITS_ID ?? (record.zakereenItsNo as string | undefined);

  const sadaratEditIcon = canEditMajlis ? (
    <Tooltip title="Change sadarat assignment">
      <IconButton
        size="small"
        aria-label="Change sadarat assignment"
        onClick={() => openOhbatMajlisSadaratDialog()}
        edge="end"
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : null;

  const khidmatEditIcon = canEditMajlis ? (
    <Tooltip title="Change khidmatguzar">
      <IconButton
        size="small"
        aria-label="Change khidmatguzar"
        onClick={() => openOhbatMajlisKhidmatDialog()}
        edge="end"
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : null;

  const zakereenEditIcon = canEditMajlis ? (
    <Tooltip title="Change zakereen">
      <IconButton
        size="small"
        aria-label="Change zakereen"
        onClick={() => openOhbatMajlisZakereenDialog()}
        edge="end"
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : null;

  const sadarat = record.sadarat as { name?: string; itsNo?: string; mobile?: string } | undefined;
  const khidmat = record.khidmatguzar as { Full_Name?: string; Mobile?: string } | undefined;
  const zakereen = record.zakereen as { Full_Name?: string; Mobile?: string } | undefined;

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          startIcon={<ContentCopyIcon />}
          variant="outlined"
          size="small"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(buildOhbatMajlisEventDetailsText(record));
              notify("Event details copied to clipboard", { type: "success" });
            } catch {
              notify("Could not copy to clipboard", { type: "error" });
            }
          }}
        >
          Copy event details
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SummaryTable title="Host & venue">
            <SummaryRow label="Host ITS" value={dash(record.hostItsNo)} />
            <SummaryRow label="Host name" value={dash(record.hostName)} />
            <SummaryRow label="Sector (from host ITS)" value={dash(record.hostSector)} />
            <SummaryRow label="Sub-sector (from host ITS)" value={dash(record.hostSubSector)} />
            <SummaryRow label="Venue address" value={dash(record.address)} />
            <SummaryRow label="Contact mobile" value={dash(record.mobileNo)} />
            <TableRow>
              <TableCell sx={{ py: 1, verticalAlign: "top", borderColor: "divider" }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Notes
                </Typography>
                <Typography
                  component="div"
                  variant="body2"
                  sx={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: { xs: 100, sm: 140 },
                    overflow: "auto",
                    pr: 0.5,
                  }}
                >
                  {dash(record.notes)}
                </Typography>
              </TableCell>
            </TableRow>
          </SummaryTable>
        </Grid>
        <Grid
          sx={(theme) => ({
            borderRight: { md: `1px solid ${theme.palette.divider}` },
            pr: { md: 2 },
          })}
          size={{ xs: 12, md: 6 }}
        >
          <SummaryTable title="Majlis & schedule">
            <SummaryRow label="Date" value={dateLabel} />
            <SummaryRow label="Time" value={timeLabel} />
            <SummaryRow label="Type" value={dash(record.type)} />
          </SummaryTable>
        </Grid>
        <Grid
          sx={(theme) => ({
            borderRight: { md: `1px solid ${theme.palette.divider}` },
            pr: { md: 2 },
          })}
          size={{ xs: 12, md: 6 }}
        >
          <SummaryTable title="Sadarat (linked)" titleAddon={sadaratEditIcon}>
            <SummaryRow label="Name" value={dash(sadarat?.name)} />
            <SummaryRow label="ITS" value={dash(sadarat?.itsNo)} />
            <SummaryRow label="Mobile" value={dash(sadarat?.mobile)} />
          </SummaryTable>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SummaryTable title="Khidmatguzar (itsdata)" titleAddon={khidmatEditIcon}>
            <SummaryRow label="ITS" value={dash(khidmatIts)} />
            <SummaryRow label="Name" value={dash(khidmat?.Full_Name)} />
            <SummaryRow label="Mobile" value={dash(khidmat?.Mobile)} />
          </SummaryTable>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SummaryTable title="Zakereen (itsdata)" titleAddon={zakereenEditIcon}>
            <SummaryRow label="ITS" value={dash(zakereenIts)} />
            <SummaryRow label="Name" value={dash(zakereen?.Full_Name)} />
            <SummaryRow label="Mobile" value={dash(zakereen?.Mobile)} />
          </SummaryTable>
        </Grid>
      </Grid>
    </Box>
  );
}
