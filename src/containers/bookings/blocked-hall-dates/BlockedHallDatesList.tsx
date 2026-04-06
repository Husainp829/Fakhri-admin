import { List, Datagrid, TextField, FunctionField, type ListProps } from "react-admin";
import { slotNameMap } from "@/constants";

export const BlockedHallDatesList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="hall.name" label="Hall" />
      <FunctionField
        label="Slot"
        source="slot"
        render={(record) => slotNameMap[String(record.slot)] || record.slot}
      />
      <TextField source="type" label="Type" />
      <FunctionField label="Date Info" source="hijriMonth" render={(record) => record.dateInfo} />
      <TextField source="event" label="Event/Reason" />
    </Datagrid>
  </List>
);

export default BlockedHallDatesList;
