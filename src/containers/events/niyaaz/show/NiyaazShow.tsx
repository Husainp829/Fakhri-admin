import { useState } from "react";
import {
  Button,
  Show,
  TabbedShowLayout,
  TopToolbar,
  usePermissions,
  useRecordContext,
  useRedirect,
  useShowContext,
  type RaRecord,
  type ShowProps,
} from "react-admin";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PrintIcon from "@mui/icons-material/Print";
import EditNoteIcon from "@mui/icons-material/ModeEdit";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useMediaQuery } from "@mui/material";
import { NiyaazShowFamilyMembers } from "./NiyaazShowFamilyMembers";
import { NiyaazShowReceipts } from "./NiyaazShowReceipts";
import { NiyaazShowBasicInfo } from "./NiyaazShowBasicInfo";
import { downloadPasses } from "@/utils";
import type { PassesProps } from "@/components/pdf";
import { hasPermission } from "@/utils/permission-utils";
const NiyaazActions = () => {
  const redirect = useRedirect();
  const { record } = useShowContext<RaRecord>();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { permissions } = usePermissions();
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });

  const toolbarSx = {
    flexWrap: "wrap",
    gap: 1,
    display: "flex",
    minHeight: 48,
    py: isSmall ? 0.5 : 1,
    my: isSmall ? 0.5 : 1,
    visibility: "visible",
    overflow: "visible",
  };

  if (isSmall) {
    return (
      <TopToolbar sx={toolbarSx}>
        {hasPermission(permissions, "receipts.create") && (
          <Tooltip title="Add Receipt">
            <IconButton
              color="success"
              onClick={() => redirect(`/receipts/create?niyaazId=${record?.id}`)}
              size="medium"
              aria-label="Add Receipt"
            >
              <ReceiptLongIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Print Passes">
          <IconButton
            color="info"
            onClick={() => record && downloadPasses(record as Partial<PassesProps>)}
            size="medium"
            aria-label="Print Passes"
          >
            <PrintIcon />
          </IconButton>
        </Tooltip>
        {hasPermission(permissions, "niyaaz.edit") && (
          <>
            <Tooltip title="Actions">
              <IconButton
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                size="medium"
                aria-label="Actions"
              >
                <EditNoteIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{ "aria-labelledby": "basic-button" }}
            >
              <MenuItem onClick={() => redirect(`/niyaaz/${record?.id}`)}>Edit Niyaaz</MenuItem>
            </Menu>
          </>
        )}
      </TopToolbar>
    );
  }

  return (
    <TopToolbar sx={toolbarSx}>
      {hasPermission(permissions, "receipts.create") && (
        <Button
          color="success"
          variant="contained"
          onClick={() => redirect(`/receipts/create?niyaazId=${record?.id}`)}
          startIcon={<ReceiptLongIcon />}
          label="Add Receipt"
        />
      )}
      <Button
        color="info"
        variant="contained"
        onClick={() => record && downloadPasses(record as Partial<PassesProps>)}
        startIcon={<PrintIcon />}
        label="Print Passes"
      />
      {hasPermission(permissions, "niyaaz.edit") && (
        <>
          <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            startIcon={<EditNoteIcon />}
            label="Actions"
          />
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{ "aria-labelledby": "basic-button" }}
          >
            <MenuItem onClick={() => redirect(`/niyaaz/${record?.id}`)}>Edit Niyaaz</MenuItem>
          </Menu>
        </>
      )}
    </TopToolbar>
  );
};

const Showtitle = () => {
  const record = useRecordContext<{ formNo?: string }>();
  return <span>{record ? `Form No. ${record.formNo}` : ""}</span>;
};

export const NiyaazShow = (props: ShowProps) => (
  <Show actions={<NiyaazActions />} title={<Showtitle />} {...props}>
    <TabbedShowLayout>
      <TabbedShowLayout.Tab label="Information">
        <NiyaazShowBasicInfo />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Family Members" path="family">
        <NiyaazShowFamilyMembers />
      </TabbedShowLayout.Tab>
      <TabbedShowLayout.Tab label="Receipts" path="receipts">
        <NiyaazShowReceipts />
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Show>
);
