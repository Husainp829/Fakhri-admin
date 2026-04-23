import {
  Datagrid,
  FunctionField,
  ReferenceField,
  ReferenceManyField,
  TextField,
  type RaRecord,
} from "react-admin";
import { formatListDate } from "@/utils/date-format";

const TakhmeenHistory = () => (
  <ReferenceManyField reference="sabilTakhmeen" target="sabilId" label={false}>
    <Datagrid>
      <TextField source="takhmeenAmount" />
      <ReferenceField source="updatedBy" reference="admins">
        <TextField source="name" />
      </ReferenceField>
      <FunctionField
        label="Start date"
        sortBy="startDate"
        render={(record: RaRecord) => formatListDate(record?.startDate, { empty: "—" })}
      />
    </Datagrid>
  </ReferenceManyField>
);

export default TakhmeenHistory;
