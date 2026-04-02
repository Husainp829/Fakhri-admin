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
  useNotify,
  useRefresh,
} from "react-admin";
import {
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import UpdateIcon from "@mui/icons-material/Update";
import WriteoffDialog from "../../sabilLedger/writeoffDialog";
import BalanceSummary from "./BalanceSummary";
import { callApi } from "../../../../dataprovider/miscApis";

const UpdateTakhmeenDialog = ({ open, onClose, selectedIds, sabilId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!selectedIds || selectedIds.length === 0 || !sabilId) {
      setError("Please select at least one ledger entry");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await callApi({
        location: "sabilLedger",
        method: "POST",
        id: "update-takhmeen",
        data: {
          sabilId,
          ledgerEntryIds: selectedIds,
        },
      });

      if (response?.data) {
        notify(
          `Successfully updated ${response.data.count || selectedIds.length} ledger entry/entries`,
          {
            type: "success",
          }
        );
        refresh();
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to update takhmeen";
      setError(errorMessage);
      notify(errorMessage, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Takhmeen</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to update the due amount for {selectedIds?.length || 0} ledger
            entry/entries to the current takhmeen?
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          label="Update Takhmeen"
        />
      </DialogActions>
    </Dialog>
  );
};

const LedgerBulkActionButtons = ({ onWriteoffSuccess, sabilId }) => {
  const { selectedIds, resource } = useListContext();
  const [writeoffOpen, setWriteoffOpen] = useState(false);
  const [updateTakhmeenOpen, setUpdateTakhmeenOpen] = useState(false);
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

  const handleUpdateTakhmeenClick = () => {
    if (selectedIds && selectedIds.length > 0) {
      setUpdateTakhmeenOpen(true);
    }
  };

  const handleUpdateTakhmeenClose = () => {
    setUpdateTakhmeenOpen(false);
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
        label="Update Takhmeen"
        onClick={handleUpdateTakhmeenClick}
        startIcon={<UpdateIcon />}
        sx={{ ml: 1 }}
      >
        Update Takhmeen ({selectedIds.length})
      </Button>
      <Button
        label="Write Off"
        onClick={handleWriteoffClick}
        startIcon={<CancelIcon />}
        sx={{ ml: 1 }}
      >
        Write Off ({selectedIds.length})
      </Button>
      <UpdateTakhmeenDialog
        open={updateTakhmeenOpen}
        onClose={handleUpdateTakhmeenClose}
        selectedIds={selectedIds}
        sabilId={sabilId}
        onSuccess={handleUpdateTakhmeenClose}
      />
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
  const fullMonthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Check if it's an establishment sabil
  const isEstablishment = record?.sabilData?.sabilType === "ESTABLISHMENT";

  // For establishment, if month is April (4), show range April {year} to March {year+1}
  if (isEstablishment && record.month === 4) {
    return (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {fullMonthNames[3]} {record.year} to {fullMonthNames[2]} {record.year + 1}
      </Typography>
    );
  }

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
          filter={{ sabilId: record?.id }}
          sort={{ field: "year", order: "DESC" }}
        >
          <Datagrid
            rowClick={false}
            bulkActionButtons={
              <LedgerBulkActionButtons
                resource="sabilLedger"
                onWriteoffSuccess={handleWriteoffSuccess}
                sabilId={record?.id}
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
