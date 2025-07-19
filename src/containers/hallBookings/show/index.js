/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Button,
  Show,
  TabbedShowLayout,
  TopToolbar,
  usePermissions,
  useRecordContext,
  useRedirect,
  useShowContext,
} from "react-admin";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EditNoteIcon from "@mui/icons-material/ModeEdit";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Receipt from "./receipts";
import BasicInfo from "./basicInfo";
import HallBookings from "./hallBookings";

const BookingActions = () => {
  const redirect = useRedirect();
  const {
    record, // record fetched via dataProvider.getOne() based on the id from the location
  } = useShowContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { permissions } = usePermissions();

  return (
    <TopToolbar>
      {permissions?.receipt?.create && (
        <Button
          color="success"
          variant="contained"
          onClick={() => {
            redirect(`/rentBookingReceipts/create?bookingId=${record?.id}`);
          }}
          sx={{ py: 1, my: 1 }}
        >
          <ReceiptLongIcon sx={{ mr: 1 }} />
          Add Receipt
        </Button>
      )}

      {permissions?.niyaaz?.edit && (
        <>
          <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            sx={{ py: 1, my: 1 }}
          >
            <EditNoteIcon sx={{ mr: 1 }} />
            Actions
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              onClick={() => {
                redirect(`/niyaaz/${record?.id}`);
              }}
            >
              Edit Booking
            </MenuItem>
          </Menu>
        </>
      )}
    </TopToolbar>
  );
};

const Showtitle = () => {
  const record = useRecordContext();
  return <span>{record ? `Booking No. ${record.BookingNo}` : ""}</span>;
};
export default ({ props }) => (
  <Show actions={<BookingActions {...props} />} title={<Showtitle />}>
    <TabbedShowLayout>
      <TabbedShowLayout.Tab label="Information">
        <BasicInfo />
        <HallBookings />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Receipts" path="receipts">
        <Receipt />
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Show>
);
