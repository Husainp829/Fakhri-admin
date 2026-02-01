import React, { useState } from "react";
import {
  DatagridConfigurable,
  List,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  DateField,
  SimpleList,
} from "react-admin";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { useMediaQuery } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ITSSyncUploadButton from "../../components/uploadHelpers/ITSSyncUpload";
import CustomEmpty from "../../components/CustomEmpty";
import PostFilterSidebar from "./PostFilterSidebar";

const ListActions = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <TopToolbar>
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

export default () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });

  return (
    <List
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
          rowSx={() => ({ borderBottom: "1px solid #e0e0e0" })}
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
            <DateField source="updatedAt" />
          </DatagridConfigurable>
        </Box>
      )}
    </List>
  );
};
