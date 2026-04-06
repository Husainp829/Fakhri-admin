import { useState } from "react";
import {
  TopToolbar,
  useRecordContext,
  Confirm,
  useRedirect,
  useNotify,
  useRefresh,
  usePermissions,
  type RaRecord,
} from "react-admin";
import PrintIcon from "@mui/icons-material/Print";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ReceiptIcon from "@mui/icons-material/Receipt";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CancelIcon from "@mui/icons-material/Cancel";
import BalanceIcon from "@mui/icons-material/Balance";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Box, Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { HallBookingsCloseBookingModal } from "./HallBookingsCloseBookingModal";
import { callApi } from "@/dataprovider/misc-apis";
import { useShowTotals } from "../BookingShowContext";
import { hasPermission } from "@/utils/permission-utils";

type ConfirmType = "raza" | "writeoff" | "refundSettled";

const ConfirmConfig: Record<
  ConfirmType,
  { title: string; content: (record: RaRecord | undefined) => string }
> = {
  raza: {
    title: "Confirm Raza Granted",
    content: (rec) =>
      `Are you sure you want to mark Raza as granted for Booking #${rec?.bookingNo as string}?`,
  },
  writeoff: {
    title: "Confirm Write-Off Booking",
    content: (rec) =>
      `Are you sure you want to write-off Booking #${rec?.bookingNo as string}? This cannot be undone.`,
  },
  refundSettled: {
    title: "Confirm Settle Refund",
    content: (rec) =>
      `Are you sure you want to settle the refund for Booking #${rec?.bookingNo as string}?`,
  },
};

export const HallBookingsShowActions = () => {
  const { permissions } = usePermissions();
  const redirect = useRedirect();
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    type: ConfirmType;
    open: boolean;
    loading: boolean;
  } | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { totalAmountPending } = useShowTotals();

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleConfirm = async () => {
    if (!record?.id || !confirmConfig) return;

    if (confirmConfig.type === "raza") {
      await callApi({
        location: `bookings/${record.id}/grant-raza`,
        method: "PUT",
      })
        .then(() => {
          notify("Raza marked successfully", { type: "success" });
        })
        .catch(() => {
          notify("Something went wrong", { type: "error" });
        });
    } else if (confirmConfig.type === "writeoff") {
      await callApi({
        location: `bookings/${record.id}/write-off`,
        method: "PUT",
      })
        .then(() => {
          notify("Writeoff successfully", { type: "success" });
        })
        .catch(() => {
          notify("Something went wrong", { type: "error" });
        });
    } else if (confirmConfig.type === "refundSettled") {
      await callApi({
        location: `bookings/${record.id}/settle-refund`,
        method: "PUT",
      })
        .then(() => {
          notify("Refund settled successfully", { type: "success" });
        })
        .catch(() => {
          notify("Something went wrong", { type: "error" });
        });
    }
    refresh();
    setConfirmConfig(null);
  };

  const onCloseEvent = async (data: {
    actualThaals: Record<string, number>;
    extraExpenses: number;
    comments: string;
  }) => {
    if (!record?.id) return;
    await callApi({
      location: `bookings/${record.id}/close`,
      data: {
        actualThaals: data.actualThaals,
        extraExpenses: data.extraExpenses,
        comments: data.comments,
      },
      method: "PUT",
    })
      .then(() => {
        notify("Raza marked successfully", { type: "success" });
      })
      .catch(() => {
        notify("Something went wrong", { type: "error" });
      });

    refresh();
    setCloseModalOpen(false);
  };

  if (!record) return null;

  return (
    <TopToolbar
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
      }}
    >
      <Box>
        <Typography variant="h5" fontWeight="bold">
          Booking #{record.bookingNo as string}
        </Typography>
      </Box>

      <Box>
        <Button
          variant="outlined"
          onClick={handleMenuClick}
          endIcon={<ArrowDropDownIcon />}
          sx={{ textTransform: "none" }}
        >
          Actions
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              redirect(`/contRcpt/create?bookingId=${record.id}`);
            }}
          >
            <ListItemIcon>
              <ReceiptLongIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add Receipt</ListItemText>
          </MenuItem>
          {!record.razaGranted && (
            <MenuItem
              onClick={() => {
                window.open(`#/raza-print/${record.id}`, "_blank");
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <PrintIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Raza form</ListItemText>
            </MenuItem>
          )}

          {!record.razaGranted && (
            <MenuItem
              onClick={() => {
                setConfirmConfig({ type: "raza", open: true, loading: false });
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <DoneAllIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Mark Raza</ListItemText>
            </MenuItem>
          )}

          {record.razaGranted && (
            <MenuItem
              onClick={() => {
                window.open(`#/confirmation-voucher/${record.id}`, "_blank");
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <ReceiptIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Print Confirmation Voucher</ListItemText>
            </MenuItem>
          )}

          {!record.checkedOutOn && (
            <MenuItem
              onClick={() => {
                setCloseModalOpen(true);
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <EventAvailableIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Close Event</ListItemText>
            </MenuItem>
          )}

          {hasPermission(permissions, "writeoff.allow") && totalAmountPending > 0 && (
            <MenuItem
              onClick={() => {
                setConfirmConfig({
                  type: "writeoff",
                  open: true,
                  loading: false,
                });
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <CancelIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Write-Off Booking</ListItemText>
            </MenuItem>
          )}
          {!record.refundReturnedOn && (
            <MenuItem
              onClick={() => {
                setConfirmConfig({
                  type: "refundSettled",
                  open: true,
                  loading: false,
                });
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <BalanceIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settle Refund</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>

      <HallBookingsCloseBookingModal
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onSubmit={(data) => {
          void onCloseEvent(data);
        }}
        record={record}
      />

      <Confirm
        isOpen={!!confirmConfig?.open}
        loading={confirmConfig?.loading}
        title={confirmConfig ? ConfirmConfig[confirmConfig.type].title : ""}
        content={confirmConfig ? ConfirmConfig[confirmConfig.type].content(record) : ""}
        onConfirm={() => void handleConfirm()}
        onClose={() => setConfirmConfig(null)}
      />
    </TopToolbar>
  );
};

export default HallBookingsShowActions;
