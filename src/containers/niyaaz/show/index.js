/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Button,
  Show,
  TabbedShowLayout,
  TopToolbar,
  useRedirect,
  useShowContext,
} from "react-admin";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EditNoteIcon from "@mui/icons-material/ModeEdit";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import FamilyMembers from "./familyMembers";
import Receipt from "./receipts";
import BasicInfo from "./basicInfo";
const NiyaazActions = () => {
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
      <Button
        color="success"
        variant="contained"
        onClick={() => {
          redirect(`/receipts/create?niyaazId=${record?.id}&formNo=${record.formNo}`);
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
            redirect(`/niyaaz/${record?.id}`);
          }}
        >
          Edit Niyaaz
        </MenuItem>
      </Menu>
    </TopToolbar>
  );
};
export default ({ props }) => (
  <Show actions={<NiyaazActions {...props} />}>
    <TabbedShowLayout>
      <TabbedShowLayout.Tab label="Information">
        <BasicInfo />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Family Members" path="family">
        <FamilyMembers />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Receipts" path="receipts">
        <Receipt />
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Show>
);
