import React from "react";
import {
  List,
  Datagrid,
  ReferenceField,
  TextField,
  DateField,
  TopToolbar,
  CreateButton,
  ExportButton,
  Pagination,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";
import DailySummarySection from "./dailySummarySection";

const filters = [
  <ReferenceInput source="fmbId" reference="fmbData" key="fmbId" label="FMB / Thaali">
    <AutocompleteInput optionText="fmbNo" label="Thaali no." debounce={300} />
  </ReferenceInput>,
];

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export default function FmbThaliSuspensionList(props) {
  return (
    <>
      <DailySummarySection />
      <List
        {...props}
        sort={{ field: "startDate", order: "DESC" }}
        perPage={25}
        pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
        filters={filters}
        actions={<ListActions />}
      >
        <Datagrid rowClick="edit" bulkActionButtons={false}>
          <ReferenceField source="fmbId" reference="fmbData" link="show" label="Thaali no.">
            <TextField source="fmbNo" />
          </ReferenceField>
          <DateField source="startDate" />
          <DateField source="endDate" />
          <TextField source="remarks" emptyText="—" />
        </Datagrid>
      </List>
    </>
  );
}
