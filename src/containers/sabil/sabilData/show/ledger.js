import React, { useRef, useState } from "react";
import {
  Datagrid,
  DateField,
  FunctionField,
  ReferenceManyField,
  TextField,
  NumberField,
  useShowContext,
  Button,
  useUnselectAll,
  useListContext,
} from "react-admin";
import { Paper, Typography, Box, Chip } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import WriteoffDialog from "../../sabilLedger/writeoffDialog";
import BalanceSummary from "./BalanceSummary";

const LedgerBulkActionButtons = ({ onWriteoffSuccess }) => {
  const { selectedIds, resource } = useListContext();
  const [writeoffOpen, setWriteoffOpen] = useState(false);
  const unselectAll = useUnselectAll(resource);

  const handleWriteoffClick = () => {
    if (selectedIds && selectedIds.length > 0) {
      setWriteoffOpen(true);
    }
  };

  const handleWriteoffClose = () => {
    setWriteoffOpen(false);
    unselectAll();
    if (onWriteoffSuccess) {
      onWriteoffSuccess();
    }
  };

  if (!selectedIds || selectedIds.length === 0) {
    return <div style={{ marginLeft: "25px" }}></div>;
  }

  return (
    <>
      <Button
        label="Write Off"
        onClick={handleWriteoffClick}
        startIcon={<CancelIcon />}
        sx={{ ml: 1 }}
      >
        Write Off ({selectedIds.length})
      </Button>
      <WriteoffDialog
        open={writeoffOpen}
        onClose={handleWriteoffClose}
        selectedIds={selectedIds}
        resource={resource}
      />
    </>
  );
};

const StatusChip = ({ status }) => {
  const statusConfig = {
    UNPAID: { label: "Unpaid", color: "error" },
    PARTIALLY_PAID: { label: "Partially Paid", color: "warning" },
    FULLY_PAID: { label: "Fully Paid", color: "success" },
    WRITTEN_OFF: { label: "Written Off", color: "default" },
  };

  const config = statusConfig[status] || { label: status, color: "default" };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{
        fontWeight: 600,
        minWidth: 100,
      }}
    />
  );
};

const MonthYearField = ({ record }) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return (
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {monthNames[record.month - 1]} {record.year}
    </Typography>
  );
};

export default () => {
  const { record } = useShowContext();
  const balanceSummaryRef = useRef();

  const handleWriteoffSuccess = () => {
    if (balanceSummaryRef.current) {
      balanceSummaryRef.current.refresh();
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Balance Summary */}
      <BalanceSummary ref={balanceSummaryRef} />

      {/* Ledger Entries */}
      <Paper elevation={1} sx={{ p: 1 }}>
        <ReferenceManyField
          reference="sabilLedger"
          target="sabilId"
          label={false}
          sort={{ field: "year", order: "DESC" }}
          filter={{ sabilId: record?.id }}
        >
          <Datagrid
            rowClick={false}
            bulkActionButtons={
              <LedgerBulkActionButtons
                resource="sabilLedger"
                onWriteoffSuccess={handleWriteoffSuccess}
              />
            }
            isRowSelectable={(ledgerEntry) => ledgerEntry.status !== "WRITTEN_OFF"}
            sx={{
              "& .RaDatagrid-headerCell": {
                fontWeight: 600,
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <FunctionField
              label="Period"
              render={(entry) => <MonthYearField record={entry} />}
            />
            <TextField source="financialYear" label="Financial Year" />
            <NumberField
              source="dueAmount"
              label="Due Amount"
              options={{ style: "currency", currency: "INR", minimumFractionDigits: 0 }}
              sx={{ fontWeight: 600 }}
            />
            <NumberField
              source="paidAmount"
              label="Paid Amount"
              options={{ style: "currency", currency: "INR", minimumFractionDigits: 0 }}
              sx={{
                color: "success.main",
                fontWeight: 500,
              }}
            />
            <NumberField
              source="openingBalance"
              label="Opening Balance"
              options={{ style: "currency", currency: "INR", minimumFractionDigits: 0 }}
            />
            <FunctionField
              label="Status"
              render={(entry) => <StatusChip status={entry.status} />}
            />
            <FunctionField
              label="Outstanding"
              render={(ledgerEntry) => {
                if (ledgerEntry.status === "WRITTEN_OFF") {
                  return (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontStyle: "italic",
                      }}
                    >
                      Written Off: ₹{(ledgerEntry.writeoffAmount || 0).toLocaleString("en-IN")}
                    </Typography>
                  );
                }
                const outstanding = (ledgerEntry.dueAmount || 0) - (ledgerEntry.paidAmount || 0);
                return (
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: outstanding > 0 ? 600 : 400,
                      color: outstanding > 0 ? "error.main" : "text.secondary",
                    }}
                  >
                    ₹{Math.max(0, outstanding).toLocaleString("en-IN")}
                  </Typography>
                );
              }}
            />
            <DateField
              source="createdAt"
              label="Created"
              showDate
              sx={{ fontSize: "0.875rem" }}
            />
          </Datagrid>
        </ReferenceManyField>
      </Paper>
    </Box>
  );
};
