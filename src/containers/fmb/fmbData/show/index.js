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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import TakhmeenHistory from "./takhmeenHistory";
import FamilyMembers from "./familyMembers";
import Receipt from "./receipts";
import BasicInfo from "./basicInfo";
import SuspensionsTab from "./suspensions";

const FmbShowActions = () => {
  const redirect = useRedirect();
  const { record } = useShowContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = record?.id;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const go = (path) => {
    handleClose();
    redirect(path);
  };

  return (
    <TopToolbar>
      <EditButton />
      <Button
        id="fmb-show-more-actions"
        aria-controls={open ? "fmb-show-more-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<MoreVertIcon />}
        color="inherit"
      >
        More
      </Button>
      <Menu
        id="fmb-show-more-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "fmb-show-more-actions" }}
      >
        <MenuItem disabled={!id} onClick={() => go(`/fmbTakhmeen/create?fmbId=${id}`)}>
          New takhmeen period
        </MenuItem>
        <MenuItem disabled={!id} onClick={() => go(`/fmbReceipt/create?fmbId=${id}`)}>
          Record receipt
        </MenuItem>
        <MenuItem disabled={!id} onClick={() => go(`/fmbThaliSuspension/create?fmbId=${id}`)}>
          Add thali suspension
        </MenuItem>
      </Menu>
    </TopToolbar>
  );
};

export default function FmbDataShow(props) {
  return (
    <Show {...props} actions={<FmbShowActions />}>
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
        <TabbedShowLayout.Tab label="Suspensions" path="suspensions">
          <SuspensionsTab />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
}
