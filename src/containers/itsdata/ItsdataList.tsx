import { useState } from "react";
import {
  DatagridConfigurable,
  ExportButton,
  List,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  FunctionField,
  SimpleList,
  type RaRecord,
} from "react-admin";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { useMediaQuery } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import ITSSyncUploadButton from "@/components/upload-helpers/its-sync-upload";
import CustomEmpty from "@/components/custom-empty";
import PostFilterSidebar from "./PostFilterSidebar";
import { formatDisplayDateTime } from "@/utils/date-format";

const ListActions = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <TopToolbar sx={{ justifyContent: "space-between" }}>
        {isSmall && (
          <IconButton
            color="primary"
            onClick={() => setFilterOpen(true)}
            aria-label="Open filters"
            size="small"
          >
            <FilterListIcon />
          </IconButton>
        )}
        {!isSmall && <SelectColumnsButton />}
        <ExportButton maxResults={5000} />
        <Button
          size="small"
          component={RouterLink}
          to="/itsdataAddressChangeQueue"
          startIcon={<EditLocationAltIcon />}
        >
          Address updates
        </Button>
        <ITSSyncUploadButton />
      </TopToolbar>
      {isSmall && (
        <Drawer
          anchor="right"
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          slotProps={{ backdrop: { sx: { top: "48px" } } }}
          PaperProps={{
            sx: { top: 48, height: "calc(100% - 48px)", maxWidth: 360 },
          }}
        >
          <Box sx={{ p: 2, overflow: "auto" }}>
            <PostFilterSidebar inDrawer />
          </Box>
        </Drawer>
      )}
    </>
  );
};

const omitColumns = [
  "Sector",
  "Sub_Sector",
  "Idara",
  "Organisation",
  "Vatan",
  "Nationality",
  "Qadambosi_Sharaf",
  "Raudat_Tahera_Ziyarat",
  "Karbala_Ziyarat",
  "Ashara_Mubaraka",
  "Housing",
  "Type_of_House",
  "Data_Verifcation_Status",
  "Photo_Verifcation_Status",
];

const ItsdataList = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });

  return (
    <List
      sx={{
        "& .RaList-actions": { justifyContent: "flex-start" },
      }}
      actions={<ListActions />}
      aside={!isSmall ? <PostFilterSidebar /> : null}
      empty={
        <CustomEmpty
          title="No ITS data found"
          subtitle="Get started by syncing an XLSX file to import ITS data"
          action={<ITSSyncUploadButton variant="contained" />}
        />
      }
    >
      {isSmall ? (
        <SimpleList
          primaryText={(record) => record.Full_Name}
          secondaryText={(record) =>
            [record.id && `ITS ${record.id}`, record.HOF_FM_TYPE].filter(Boolean).join(" · ")
          }
          linkType="show"
          rowSx={() => ({ borderBottom: 1, borderBottomColor: "divider" })}
        />
      ) : (
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <DatagridConfigurable
            rowClick="show"
            bulkActionButtons={false}
            omit={omitColumns}
            sx={{ minWidth: 960 }}
          >
            <TextField source="id" label="ITS" />
            <TextField source="HOF_FM_TYPE" label="Type" />
            <TextField source="HOF_ID" label="HOF ITS" />
            <TextField source="Full_Name" />
            <TextField source="Age" />
            <TextField source="Gender" />
            <TextField source="Mobile" />
            <TextField source="Email" />
            <TextField source="Address" />
            <TextField source="Sector" />
            <TextField source="Sub_Sector" />
            <TextField source="Idara" />
            <TextField source="Organisation" />
            <TextField source="Vatan" />
            <TextField source="Nationality" />
            <TextField source="Qadambosi_Sharaf" />
            <TextField source="Raudat_Tahera_Ziyarat" />
            <TextField source="Karbala_Ziyarat" />
            <TextField source="Ashara_Mubaraka" />
            <TextField source="Housing" />
            <TextField source="Type_of_House" />
            <TextField source="Data_Verifcation_Status" />
            <TextField source="Photo_Verifcation_Status" />
            <FunctionField
              label="Updated"
              sortBy="updatedAt"
              render={(record: RaRecord) =>
                formatDisplayDateTime(record?.updatedAt, { empty: "—" })
              }
            />
          </DatagridConfigurable>
        </Box>
      )}
    </List>
  );
};

export default ItsdataList;
