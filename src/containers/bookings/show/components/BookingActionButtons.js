/* eslint-disable no-console */
import React, { useState } from "react";
import {
  TopToolbar,
  useRecordContext,
  Confirm,
  useRedirect,
  useNotify,
  useRefresh,
  usePermissions,
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
import CloseBookingModal from "./CloseBookingModal";
import { callApi } from "../../../../dataprovider/miscApis";
import { calcBookingTotals } from "../../../../utils/bookingCalculations";

const ConfirmConfig = {
  raza: {
    title: "Confirm Raza Granted",
    content: (record) =>
      `Are you sure you want to mark Raza as granted for Booking #${record?.bookingNo}?`,
  },
  writeoff: {
    title: "Confirm Write-Off Booking",
    content: (record) =>
      `Are you sure you want to write-off Booking #${record?.bookingNo}? This cannot be undone.`,
  },
  refundSettled: {
    title: "Confirm Settle Refund",
    content: (record) =>
      `Are you sure you want to settle the refund for Booking #${record?.bookingNo}?`,
  },
};

const BookingShowActions = () => {
  const { permissions } = usePermissions();
  const redirect = useRedirect();
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null); // { type, open, loading }
  const [anchorEl, setAnchorEl] = useState(null);

  if (!record) return null;

  const { totalAmountPending } = calcBookingTotals({
    halls: record.hallBookings,
    ...record,
    jamaatLagatUnit: record.bookingPurpose?.jamaatLagat || 0,
    perThaalCost: record.bookingPurpose?.perThaal,
    mohalla: record.mohalla,
  });

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleConfirm = async () => {
    if (confirmConfig?.type === "raza") {
      await callApi(`bookings/${record.id}/grant-raza`, {}, "PUT")
        .then(() => {
          notify("Raza marked successfully", { type: "success" });
        })
        .catch(() => {
          notify("Something went wrong", { type: "error" });
        });
    } else if (confirmConfig?.type === "writeoff") {
      await callApi(`bookings/${record.id}/write-off`, {}, "PUT")
        .then(() => {
          notify("Writeoff successfully", { type: "success" });
        })
        .catch(() => {
          notify("Something went wrong", { type: "error" });
        });
      // API call here
    } else if (confirmConfig?.type === "refundSettled") {
      await callApi(`bookings/${record.id}/settle-refund`, {}, "PUT")
        .then(() => {
          notify("Refund settled successfully", { type: "success" });
        })
        .catch(() => {
          notify("Something went wrong", { type: "error" });
        });
      // API call here
    }
    refresh();
    setConfirmConfig(null);
  };

  const onClose = async (data) => {
    await callApi(
      `bookings/${record.id}/close`,
      {
        actualThaals: data.actualThaals,
        extraExpenses: data.extraExpenses,
        comments: data.comments,
      },
      "PUT"
    )
      .then(() => {
        notify("Raza marked successfully", { type: "success" });
      })
      .catch(() => {
        notify("Something went wrong", { type: "error" });
      });

    refresh();
    setCloseModalOpen(false);
  };

  return (
    <TopToolbar
      sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}
    >
      <Box>
        <Typography variant="h5" fontWeight="bold">
          Booking #{record?.bookingNo}
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
              redirect(`/contRcpt/create?bookingId=${record?.id}`);
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

          {permissions?.writeoff?.allow && totalAmountPending > 0 && (
            <MenuItem
              onClick={() => {
                setConfirmConfig({ type: "writeoff", open: true, loading: false });
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
                setConfirmConfig({ type: "refundSettled", open: true, loading: false });
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

      {/* Close Event Modal */}
      <CloseBookingModal
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onSubmit={(data) => {
          onClose(data);
        }}
        record={record}
        hallBookings={[]}
      />

      {/* Confirm Dialog */}
      <Confirm
        isOpen={!!confirmConfig?.open}
        loading={confirmConfig?.loading}
        title={ConfirmConfig[confirmConfig?.type]?.title}
        content={ConfirmConfig[confirmConfig?.type]?.content(record)}
        onConfirm={handleConfirm}
        onClose={() => setConfirmConfig(null)}
      />
    </TopToolbar>
  );
};

export default BookingShowActions;
