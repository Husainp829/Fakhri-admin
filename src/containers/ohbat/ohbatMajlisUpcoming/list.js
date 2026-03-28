import React from "react";
import {
  Datagrid,
  DateField,
  FunctionField,
  List,
  TextField,
  Title,
  useCreatePath,
} from "react-admin";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";

const RecordAttendanceButton = ({ record }) => {
  const createPath = useCreatePath();
  const base = createPath({ resource: "ohbatMajlisAttendance", type: "create" });
  const to = `${base}?ohbatMajalisId=${encodeURIComponent(record.id)}`;
  return (
    <Button component={Link} to={to} size="small" variant="outlined">
      Record attendance
    </Button>
  );
};

const OhbatMajlisUpcomingList = () => (
  <>
    <Title title="Upcoming ohbat majlis" />
    <List resource="ohbatMajlisUpcoming" pagination={false} perPage={500}>
      <Datagrid bulkActionButtons={false}>
        <DateField source="date" />
        <TextField source="type" />
        <TextField source="slot" />
        <FunctionField label="Sadarat" render={(r) => r.sadarat?.name || "—"} />
        <TextField source="hostItsNo" label="Host ITS" />
        <TextField source="hostName" label="Host name" />
        <FunctionField label="" render={(r) => <RecordAttendanceButton record={r} />} />
      </Datagrid>
    </List>
  </>
);

export default OhbatMajlisUpcomingList;
