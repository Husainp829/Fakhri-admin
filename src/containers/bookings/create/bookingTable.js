import React from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Button } from "@mui/material";
import { ReferenceField, TextField } from "react-admin";
import dayjs from "dayjs";

export default function HallBookingTable({ fields, remove }) {
  if (fields?.length === 0) {
    return null;
  }
  return (
    <Table size="small" sx={{ mt: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell>Hall</TableCell>
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
                link={false} // disables link to show plain text
                sx={{ mr: 1 }}
              >
                <TextField source="name" />
              </ReferenceField>
              <br />({hb.withAC ? "With AC" : "W/O AC"})
            </TableCell>
            <TableCell>{dayjs(hb.date).format("DD-MM-YYYY")}</TableCell>
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
