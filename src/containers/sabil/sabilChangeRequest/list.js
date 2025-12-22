import React from "react";
import {
  Datagrid,
  List,
  TextField,
  ReferenceField,
  ChipField,
  FunctionField,
  DateField,
} from "react-admin";
import { getColor } from "./utils";

export default () => (
  <List sort={{ field: "createdAt", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="changeType" />
      <ReferenceField source="sabilId" reference="sabilData" link="show">
        <TextField source="sabilNo" />
      </ReferenceField>
      <TextField source="transferTo" />
      <TextField source="fromITS" label="From ITS" />
      <TextField source="toITS" label="To ITS" />
      <FunctionField
        label="Status"
        source="status"
        render={(record) => <ChipField source="status" color={getColor(record.status)} />}
      />
      <TextField source="remarks" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);
