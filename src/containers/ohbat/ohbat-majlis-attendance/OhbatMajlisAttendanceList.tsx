import { Datagrid, FunctionField, List, TextField, type RaRecord } from "react-admin";
import { formatDisplayDateTime } from "@/utils/date-format";

export default function OhbatMajlisAttendanceList() {
  return (
    <List sort={{ field: "createdAt", order: "DESC" }} perPage={25}>
      <Datagrid rowClick={false} bulkActionButtons={false}>
        <TextField source="ohbatMajalisId" label="Majlis id" />
        <TextField source="attendeeIts" label="Attendee ITS" />
        <FunctionField
          label="Recorded"
          sortBy="createdAt"
          render={(record: RaRecord) => formatDisplayDateTime(record?.createdAt, { empty: "—" })}
        />
      </Datagrid>
    </List>
  );
}
