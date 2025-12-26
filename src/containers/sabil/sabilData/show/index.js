import React, { useState } from "react";
import {
  Show,
  TabbedShowLayout,
  TopToolbar,
  useRedirect,
  useShowContext,
  usePermissions,
} from "react-admin";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EditNoteIcon from "@mui/icons-material/ModeEdit";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { hasPermission } from "../../../../utils/permissionUtils";

import FamilyMembers from "./familyMembers";
import Receipt from "./receipts";
import BasicInfo from "./basicInfo";
import Ledger from "./ledger";
const SabilActions = () => {
  const redirect = useRedirect();
  const { permissions } = usePermissions();
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
      {hasPermission(permissions, "sabilReceipts.create") && (
        <Button
          variant="text"
          onClick={() => {
            redirect(`/sabilReceipt/create?sabilId=${record?.id}`);
          }}
          startIcon={<ReceiptLongIcon />}
        >
          Add Receipt
        </Button>
      )}
      <Button
        variant="text"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        startIcon={<EditNoteIcon />}
      >
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
        {hasPermission(permissions, "sabil.edit") && (
          <MenuItem
            onClick={() => {
              redirect(`/sabilData/${record?.id}`);
            }}
          >
            Edit Sabil
          </MenuItem>
        )}
        {hasPermission(permissions, "sabil.create") && (
          <MenuItem
            onClick={() => {
              redirect(`/sabilTakhmeen/create?sabilId=${record?.id}`);
            }}
          >
            Update Takhmeen
          </MenuItem>
        )}
        {hasPermission(permissions, "sabil.create") && (
          <MenuItem
            onClick={() => {
              redirect(`/sabilChangeRequests/create?sabilId=${record?.id}`);
            }}
          >
            Close/Transfer
          </MenuItem>
        )}
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
      <TabbedShowLayout.Tab label="Ledger" path="ledger">
        <Ledger />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Receipts" path="receipts">
        <Receipt />
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Show>
);
