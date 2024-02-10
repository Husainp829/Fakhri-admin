import React from "react";
import {
  CreateButton,
  DatagridConfigurable,
  DateField,
  ExportButton,
  List,
  NumberField,
  SearchInput,
  SelectColumnsButton,
  TextField,
  TopToolbar,
} from "react-admin";
import ImportButton from "../../components/uploadHelpers/ITSUpload";

const ListActions = () => (
  <TopToolbar>
    <CreateButton label="Create HOF" />
    <SelectColumnsButton />
    <ExportButton />
    <ImportButton />
  </TopToolbar>
);

const itsFilters = [<SearchInput source="q" alwaysOn key="q" />];
export default () => (
  <List actions={<ListActions />} filters={itsFilters}>
    <DatagridConfigurable rowClick="edit">
      <TextField source="id" label="ITS" />
      <TextField source="HOF_FM_TYPE" label="Type" />
      <TextField source="HOF_ID" label="HOF ITS" />
      <TextField source="Family_ID" />
      <TextField source="Father_ITS_ID" />
      <TextField source="Mother_ITS_ID" />
      <TextField source="Spouse_ITS_ID" />
      <TextField source="TanzeemFile_No" />
      <TextField source="Full_Name" />
      <TextField source="Full_Name_Arabic" />
      <TextField source="First_Prefix" />
      <DateField source="Prefix_Year" />
      <TextField source="First_Name" />
      <TextField source="Father_Prefix" />
      <TextField source="Father_Name" />
      <TextField source="Father_Surname" />
      <DateField source="Husband_Prefix" />
      <TextField source="Husband_Name" />
      <TextField source="Surname" />
      <TextField source="Age" />
      <TextField source="Gender" />
      <TextField source="Misaq" />
      <TextField source="Marital_Status" />
      <TextField source="Blood_Group" />
      <TextField source="Warakatul_Tarkhis" />
      <TextField source="Date_Of_Nikah" />
      <TextField source="Date_Of_Nikah_Hijri" />
      <TextField source="Mobile" />
      <TextField source="Email" />
      <TextField source="Title" />
      <DateField source="Category" />
      <DateField source="Idara" />
      <TextField source="Organisation" />
      <TextField source="Organisation_CSV" />
      <TextField source="Vatan" />
      <TextField source="Nationality" />
      <TextField source="Jamaat" />
      <TextField source="Jamiaat" />
      <TextField source="Qualification" />
      <TextField source="Languages" />
      <TextField source="Hunars" />
      <TextField source="Occupation" />
      <TextField source="Sub_Occupation" />
      <TextField source="Sub_Occupation2" />
      <TextField source="Quran_Sanad" />
      <TextField source="Qadambosi_Sharaf" />
      <TextField source="Raudat_Tahera_Ziyarat" />
      <TextField source="Karbala_Ziyarat" />
      <NumberField source="Ashara_Mubaraka" />
      <TextField source="Housing" />
      <TextField source="Type_of_House" />
      <TextField source="Address" />
      <DateField source="Building" />
      <DateField source="Street" />
      <DateField source="Area" />
      <TextField source="State" />
      <TextField source="City" />
      <TextField source="Pincode" />
      <TextField source="Sector" />
      <TextField source="Sub_Sector" />
      <DateField source="Inactive_Status" />
      <TextField source="Data_Verifcation_Status" />
      <TextField source="Data_Verification_Date" />
      <TextField source="Photo_Verifcation_Status" />
      <TextField source="Photo_Verification_Date" />
      <TextField source="Last_Scanned_Event" />
      <TextField source="Last_Scanned_Place" />
      <TextField source="Sector_Incharge_ITSID" />
      <TextField source="Sector_Incharge_Name" />
      <TextField source="Sector_Incharge_Female_ITSID" />
      <TextField source="Sector_Incharge_Female_Name" />
      <TextField source="Sub_Sector_Incharge_ITSID" />
      <TextField source="Sub_Sector_Incharge_Name" />
      <TextField source="Sub_Sector_Incharge_Female_ITSID" />
      <TextField source="Sub_Sector_Incharge_Female_Name" />
      <TextField source="createdAt" />
      <TextField source="updatedAt" />
    </DatagridConfigurable>
  </List>
);
