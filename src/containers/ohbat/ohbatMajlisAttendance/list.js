import React from "react";
import { Datagrid, DateField, List, TextField } from "react-admin";

const OhbatMajlisAttendanceList = () => (
  <List sort={{ field: "createdAt", order: "DESC" }} perPage={25}>
    <Datagrid rowClick={false} bulkActionButtons={false}>
      <TextField source="ohbatMajalisId" label="Majlis id" />
      <TextField source="attendeeIts" label="Attendee ITS" />
      <DateField source="createdAt" showTime />
    </Datagrid>
  </List>
);

export default OhbatMajlisAttendanceList;
