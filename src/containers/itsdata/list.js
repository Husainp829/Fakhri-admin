import React from "react";
import {
  DatagridConfigurable,
  List,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  DateField,
} from "react-admin";
import ITSSyncUploadButton from "../../components/uploadHelpers/ITSSyncUpload";
import CustomEmpty from "../../components/CustomEmpty";
import PostFilterSidebar from "./PostFilterSidebar";

const ListActions = () => (
  <TopToolbar>
    <SelectColumnsButton />
    <ITSSyncUploadButton />
  </TopToolbar>
);
export default () => (
  <List
    actions={<ListActions />}
    aside={<PostFilterSidebar />}
    empty={
      <CustomEmpty
        title="No ITS data found"
        subtitle="Get started by syncing an XLSX file to import ITS data"
        action={<ITSSyncUploadButton variant="contained" />}
      />
    }
  >
    <DatagridConfigurable
      rowClick=""
      bulkActionButtons={false}
      omit={[
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
      ]}
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
  </List>
);
