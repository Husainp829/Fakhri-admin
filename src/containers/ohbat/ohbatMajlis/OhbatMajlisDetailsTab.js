import React from "react";
import { usePermissions, useRecordContext } from "react-admin";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { capitalize } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import { hasPermission } from "../../../utils/permissionUtils";
import {
  openOhbatMajlisKhidmatDialog,
  openOhbatMajlisSadaratDialog,
} from "./ohbatMajlisShowDialogOpeners";

const dash = (v) => (v != null && String(v).trim() !== "" ? v : "—");

const LabelValue = ({ label, value }) => (
  <Typography component="div" sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 0.5 }}>
    <span>{label}:</span>
    <strong style={{ textAlign: "right", wordBreak: "break-word" }}>{value}</strong>
  </Typography>
);

function SummaryTable({ title, titleAddon, children }) {
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
      <Table size="small" aria-label={title} sx={{ borderTop: "1px solid #efefef" }}>
        <TableBody>{children}</TableBody>
      </Table>
    </>
  );
}

function SummaryRow({ label, value }) {
  return (
    <TableRow>
      <TableCell sx={{ py: 1, verticalAlign: "top", borderColor: "#f0f0f0" }}>
        <LabelValue label={label} value={value} />
      </TableCell>
    </TableRow>
  );
}

/**
 * Compact two-column summary (hall booking–style) for ohbat majlis show.
 */
export default function OhbatMajlisDetailsTab() {
  const record = useRecordContext();
  const { permissions } = usePermissions();
  const canEditMajlis = hasPermission(permissions, "ohbatMajalis.edit");

  if (!record) {
    return null;
  }

  const slotLabel = record.slot ? capitalize(String(record.slot)) : "—";
  const dateLabel = record.date ? dayjs(record.date).format("DD MMM YYYY") : "—";

  const khidmatIts = record.khidmatguzar?.ITS_ID ?? record.khidmatguzarItsNo;

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

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, pb: 2 }}>
      <Grid container spacing={3}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <SummaryTable title="Host & venue">
            <SummaryRow label="Host ITS" value={dash(record.hostItsNo)} />
            <SummaryRow label="Host name" value={dash(record.hostName)} />
            <SummaryRow label="Venue address" value={dash(record.address)} />
            <SummaryRow label="Contact mobile" value={dash(record.mobileNo)} />
            <TableRow>
              <TableCell sx={{ py: 1, verticalAlign: "top", borderColor: "#f0f0f0" }}>
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
          item
          size={{ xs: 12, md: 6 }}
          sx={{
            borderRight: { md: "1px solid #efefef" },
            pr: { md: 2 },
          }}
        >
          <SummaryTable title="Majlis & schedule">
            <SummaryRow label="Date" value={dateLabel} />
            <SummaryRow label="Slot" value={slotLabel} />
            <SummaryRow label="Type" value={dash(record.type)} />
          </SummaryTable>
        </Grid>
        <Grid
          item
          size={{ xs: 12, md: 6 }}
          sx={{
            borderRight: { md: "1px solid #efefef" },
            pr: { md: 2 },
          }}
        >
          <SummaryTable title="Sadarat (linked)" titleAddon={sadaratEditIcon}>
            <SummaryRow label="Name" value={dash(record.sadarat?.name)} />
            <SummaryRow label="ITS" value={dash(record.sadarat?.itsNo)} />
            <SummaryRow label="Mobile" value={dash(record.sadarat?.mobile)} />
          </SummaryTable>
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <SummaryTable title="Khidmatguzar (itsdata)" titleAddon={khidmatEditIcon}>
            <SummaryRow label="ITS" value={dash(khidmatIts)} />
            <SummaryRow label="Name" value={dash(record.khidmatguzar?.Full_Name)} />
            <SummaryRow label="Mobile" value={dash(record.khidmatguzar?.Mobile)} />
          </SummaryTable>
        </Grid>
      </Grid>
    </Box>
  );
}
