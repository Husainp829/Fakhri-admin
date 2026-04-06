import { Datagrid, DateField, List, TextField } from "react-admin";

export default function OhbatMajlisAttendanceList() {
  return (
    <List sort={{ field: "createdAt", order: "DESC" }} perPage={25}>
      <Datagrid rowClick={false} bulkActionButtons={false}>
        <TextField source="ohbatMajalisId" label="Majlis id" />
        <TextField source="attendeeIts" label="Attendee ITS" />
        <DateField source="createdAt" showTime />
      </Datagrid>
    </List>
  );
}
