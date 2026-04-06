import {
  Datagrid,
  List,
  TextField,
  ReferenceField,
  ChipField,
  FunctionField,
  DateField,
} from "react-admin";
import type { RaRecord } from "react-admin";
import { getColor } from "./utils";

const SabilChangeRequestList = () => (
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
        render={(record: RaRecord) => (
          <ChipField source="status" record={record} color={getColor(record.status as string)} />
        )}
      />
      <TextField source="remarks" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export default SabilChangeRequestList;
