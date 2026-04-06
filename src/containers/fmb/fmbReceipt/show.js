import React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  FunctionField,
  ReferenceField,
  TopToolbar,
  Button,
  useRecordContext,
} from "react-admin";
import DownloadIcon from "@mui/icons-material/Download";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { formatINR } from "@/utils";

function printReceipt(id) {
  if (!id) return;
  window.open(`#/fmb-receipt?receiptId=${id}`, "_blank");
}

const ShowActions = () => {
  const record = useRecordContext();
  return (
    <TopToolbar>
      <Button label="Print" onClick={() => printReceipt(record?.id)}>
        <DownloadIcon />
      </Button>
    </TopToolbar>
  );
};

function AllocationTable() {
  const record = useRecordContext();
  const allocations = Array.isArray(record?.allocations) ? record.allocations : [];

  if (!allocations.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        No allocation lines.{" "}
        {record?.unallocatedAmount > 0 ? "Full amount recorded as credit." : ""}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Target</TableCell>
            <TableCell align="right">Amount (₹)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allocations.map((a, idx) => {
            const kind = a?.fmbContributionId ? "Contribution" : "Annual";
            let target = a?.fmbContributionId ?? a?.fmbTakhmeenId ?? "—";
            if (a?.fmbContribution?.contributionType != null) {
              target = `${a.fmbContribution.contributionType} · ITS ${a.fmbContribution.beneficiaryItsNo ?? "—"}`;
            } else if (a?.fmbTakhmeen) {
              target = `${a.fmbTakhmeen.hijriYearStart ?? "—"}–${a.fmbTakhmeen.hijriYearEnd ?? "—"}`;
            }
            return (
              <TableRow key={a?.id ?? idx}>
                <TableCell>{kind}</TableCell>
                <TableCell>{target}</TableCell>
                <TableCell align="right">{formatINR(a?.amount ?? 0)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function FmbReceiptShow(props) {
  return (
    <Show {...props} actions={<ShowActions />}>
      <SimpleShowLayout sx={{ maxWidth: 760 }}>
        <TextField source="receiptNo" label="Receipt no" />
        <DateField source="receiptDate" label="Receipt date" />
        <ReferenceField source="fmbId" reference="fmbData" link="show" label="FMB">
          <TextField source="fileNo" />
        </ReferenceField>
        <ReferenceField source="fmbId" reference="fmbData" link="show" label="HOF ITS">
          <TextField source="itsNo" />
        </ReferenceField>
        <FunctionField
          label="Total amount"
          render={(record) => formatINR(record?.amount, { empty: "—" })}
        />
        <FunctionField
          label="Credit used"
          render={(record) => formatINR(record?.creditUsed ?? 0, { empty: "—" })}
        />
        <FunctionField
          label="Unallocated (credit)"
          render={(record) => formatINR(record?.unallocatedAmount, { empty: "—" })}
        />
        <TextField source="paymentMode" label="Payment mode" />
        <TextField source="remarks" label="Remarks" />

        <FunctionField label="Allocations" render={() => <AllocationTable />} />
      </SimpleShowLayout>
    </Show>
  );
}
