import { useRef, useState } from "react";
import type { RaRecord } from "react-admin";
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
import { alpha } from "@mui/material/styles";
import CancelIcon from "@mui/icons-material/Cancel";
import UpdateIcon from "@mui/icons-material/Update";
import WriteoffDialog from "@/containers/sabil/sabil-ledger/WriteoffDialog";
import BalanceSummary, { type BalanceSummaryHandle } from "./BalanceSummary";
import { callApi } from "@/dataprovider/misc-apis";

type LedgerRow = RaRecord & {
  month?: number;
  year?: number;
  sabilData?: RaRecord & { sabilType?: string };
  status?: string;
  dueAmount?: number;
  paidAmount?: number;
  writeoffAmount?: number;
};

type UpdateTakhmeenDialogProps = {
  open: boolean;
  onClose: () => void;
  selectedIds: (string | number)[];
  sabilId?: string | number;
  onSuccess?: () => void;
};

const UpdateTakhmeenDialog = ({
  open,
  onClose,
  selectedIds,
  sabilId,
  onSuccess,
}: UpdateTakhmeenDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        const payload = response.data as { count?: number };
        notify(`Successfully updated ${payload.count || selectedIds.length} ledger entry/entries`, {
          type: "success",
        });
        refresh();
        onSuccess?.();
        handleClose();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = e?.response?.data?.message || e?.message || "Failed to update takhmeen";
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
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
          label="Update Takhmeen"
        />
      </DialogActions>
    </Dialog>
  );
};

type LedgerBulkActionButtonsProps = {
  onWriteoffSuccess: () => void;
  sabilId?: string | number;
};

const LedgerBulkActionButtons = ({ onWriteoffSuccess, sabilId }: LedgerBulkActionButtonsProps) => {
  const { selectedIds, resource } = useListContext();
  const [writeoffOpen, setWriteoffOpen] = useState(false);
  const [updateTakhmeenOpen, setUpdateTakhmeenOpen] = useState(false);
  const unselectAll = useUnselectAll(resource);

  const handleWriteoffClose = () => {
    setWriteoffOpen(false);
    unselectAll();
    onWriteoffSuccess();
  };

  const handleUpdateTakhmeenClose = () => {
    setUpdateTakhmeenOpen(false);
    unselectAll();
    onWriteoffSuccess();
  };

  if (!selectedIds || selectedIds.length === 0) {
    return <div style={{ marginLeft: "25px" }} />;
  }

  return (
    <>
      <Button
        label="Update Takhmeen"
        onClick={() => setUpdateTakhmeenOpen(true)}
        startIcon={<UpdateIcon />}
        sx={{ ml: 1 }}
      >
        Update Takhmeen ({selectedIds.length})
      </Button>
      <Button
        label="Write Off"
        onClick={() => setWriteoffOpen(true)}
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

const StatusChip = ({ status }: { status?: string }) => {
  const statusConfig: Record<
    string,
    { label: string; color: "error" | "warning" | "success" | "default" }
  > = {
    UNPAID: { label: "Unpaid", color: "error" },
    PARTIALLY_PAID: { label: "Partially Paid", color: "warning" },
    FULLY_PAID: { label: "Fully Paid", color: "success" },
    WRITTEN_OFF: { label: "Written Off", color: "default" },
  };

  const config = (status && statusConfig[status]) || {
    label: status || "",
    color: "default" as const,
  };

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

const MonthYearField = ({ record }: { record: LedgerRow }) => {
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

  const isEstablishment = record?.sabilData?.sabilType === "ESTABLISHMENT";

  if (isEstablishment && record.month === 4) {
    return (
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {fullMonthNames[3]} {record.year} to {fullMonthNames[2]} {(record.year ?? 0) + 1}
      </Typography>
    );
  }

  return (
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {record.month != null ? monthNames[record.month - 1] : ""} {record.year}
    </Typography>
  );
};

const Ledger = () => {
  const { record } = useShowContext<RaRecord>();
  const balanceSummaryRef = useRef<BalanceSummaryHandle | null>(null);

  const handleWriteoffSuccess = () => {
    balanceSummaryRef.current?.refresh();
  };

  return (
    <Box sx={{ p: 1 }}>
      <BalanceSummary ref={balanceSummaryRef} />

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
                onWriteoffSuccess={handleWriteoffSuccess}
                sabilId={record?.id}
              />
            }
            isRowSelectable={(ledgerEntry) => ledgerEntry.status !== "WRITTEN_OFF"}
            sx={(theme) => ({
              "& .RaDatagrid-headerCell": {
                fontWeight: 600,
                bgcolor: alpha(theme.palette.text.primary, 0.06),
              },
            })}
          >
            <FunctionField
              label="Period"
              render={(entry: LedgerRow) => <MonthYearField record={entry} />}
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
            <DateField source="createdAt" label="Created" showDate sx={{ fontSize: "0.875rem" }} />
          </Datagrid>
        </ReferenceManyField>
      </Paper>
    </Box>
  );
};

export default Ledger;
