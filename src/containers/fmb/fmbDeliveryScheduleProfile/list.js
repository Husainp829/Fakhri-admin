import React from "react";
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  NumberField,
  TopToolbar,
  CreateButton,
  ExportButton,
  Pagination,
} from "react-admin";
import { formatIsoWeekdayList } from "../fmbIsoWeekdayChoices";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export default function FmbDeliveryScheduleProfileList(props) {
  return (
    <List
      {...props}
      sort={{ field: "code", order: "ASC" }}
      perPage={25}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
      actions={<ListActions />}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="code" />
        <TextField source="name" />
        <FunctionField
          label="Weekdays (ISO)"
          render={(record) => formatIsoWeekdayList(record.deliveryWeekdays)}
        />
        <NumberField source="cutoffOffsetDays" emptyText="(default)" />
        <NumberField source="cutoffMinutes" emptyText="(default)" />
      </Datagrid>
    </List>
  );
}
