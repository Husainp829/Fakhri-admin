import { Table, TableHead, TableBody, TableRow, TableCell, Button } from "@mui/material";
import { ReferenceField, TextField, type RaRecord } from "react-admin";
import dayjs from "dayjs";

type HallBookingRow = RaRecord & {
  hallId?: string;
  purpose?: string;
  date?: string;
  slot?: string;
  thaals?: number;
  withAC?: boolean;
};

export function HallBookingsBookingTable({
  fields,
  remove,
}: {
  fields: HallBookingRow[];
  remove: (index: number) => void;
}) {
  if (!fields?.length) {
    return null;
  }
  return (
    <Table size="small" sx={{ mt: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell>Hall</TableCell>
          <TableCell>Purpose</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Slot</TableCell>
          <TableCell>Thaals</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {fields.map((hb, index) => (
          <TableRow key={hb.id}>
            <TableCell>
              <ReferenceField
                source="hallId"
                reference="halls"
                record={hb}
                link={false}
                sx={{ mr: 1 }}
              >
                <TextField source="name" />
              </ReferenceField>
              <br />({hb.withAC ? "With AC" : "W/O AC"})
            </TableCell>
            <TableCell>{hb.purpose}</TableCell>
            <TableCell>{hb.date ? dayjs(hb.date).format("DD-MM-YYYY") : ""}</TableCell>
            <TableCell sx={{ textTransform: "capitalize" }}>{hb.slot}</TableCell>
            <TableCell>{hb.thaals}</TableCell>
            <TableCell>
              <Button size="small" color="error" onClick={() => remove(index)}>
                Remove
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default HallBookingsBookingTable;
