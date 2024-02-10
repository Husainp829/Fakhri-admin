/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Button,
  EditButton,
  Show,
  TabbedShowLayout,
  TopToolbar,
  useRedirect,
  useShowContext,
} from "react-admin";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import EditNoteIcon from "@mui/icons-material/ModeEdit";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import TakhmeenHistory from "./takhmeenHistory";
import FamilyMembers from "./familyMembers";
import Receipt from "./receipts";
import BasicInfo from "./basicInfo";
const SabilActions = () => {
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

  return (
    <TopToolbar>
      {/* <Button
        color="primary"
        variant="outlined"
        onClick={() => {
          redirect(`/sabilReceipt/create?sabilId=${record?.id}`);
        }}
      >
        <ReceiptLongIcon sx={{ mr: 1 }} />
        Add Payment
      </Button>
      <EditButton variant="outlined" />
      <Button
        color="success"
        variant="contained"
        onClick={() => {
          redirect(`/sabilTakhmeen/create?sabilId=${record?.id}`);
        }}
      >
        <UpgradeIcon sx={{ mr: 1 }} />
        Update Takhmeen
      </Button> */}
      <Button
        color="success"
        variant="contained"
        onClick={() => {
          redirect(`/sabilReceipt/create?sabilId=${record?.id}`);
        }}
      >
        <ReceiptLongIcon sx={{ mr: 1 }} />
        Add Receipt
      </Button>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
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
            redirect(`/sabilData/${record?.id}`);
          }}
        >
          Edit Sabil
        </MenuItem>
        <MenuItem
          onClick={() => {
            redirect(`/sabilTakhmeen/create?sabilId=${record?.id}`);
          }}
        >
          Update Takhmeen
        </MenuItem>
        <MenuItem
          onClick={() => {
            redirect(`/sabilChangeRequests/create?sabilId=${record?.id}`);
          }}
        >
          Close/Transfer
        </MenuItem>
      </Menu>
    </TopToolbar>
  );
};
export default ({ props }) => (
  <Show actions={<SabilActions {...props} />}>
    <TabbedShowLayout>
      <TabbedShowLayout.Tab label="Information">
        <BasicInfo />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Family Members" path="family">
        <FamilyMembers />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Takhmeen History" path="takhmeenHistory">
        <TakhmeenHistory />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Receipts" path="receipts">
        <Receipt />
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Show>
);
