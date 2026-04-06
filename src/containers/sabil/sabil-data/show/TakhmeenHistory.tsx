import { Datagrid, DateField, ReferenceField, ReferenceManyField, TextField } from "react-admin";

const TakhmeenHistory = () => (
  <ReferenceManyField reference="sabilTakhmeen" target="sabilId" label={false}>
    <Datagrid>
      <TextField source="takhmeenAmount" />
      <ReferenceField source="updatedBy" reference="admins">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="startDate" />
    </Datagrid>
  </ReferenceManyField>
);

export default TakhmeenHistory;
