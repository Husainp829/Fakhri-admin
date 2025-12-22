import React from "react";
import {
  Button,
  Datagrid,
  DateField,
  FunctionField,
  NumberField,
  ReferenceField,
  ReferenceManyField,
  TextField,
  useRedirect,
} from "react-admin";

export default () => {
  const redirect = useRedirect();

  return (
    <ReferenceManyField reference="fmbTakhmeen" target="fmbId" label={false}>
      <Datagrid>
        <TextField source="takhmeenAmount" />
        <TextField source="takhmeenYear" />
        <NumberField source="pendingBalance" />
        <NumberField source="paidBalance" />
        <ReferenceField source="updatedBy" reference="admins">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="startDate" />
        <FunctionField
          label="Add Payment"
          source="fmbId"
          render={(record) => (
            <Button
              variant="contained"
              onClick={() => {
                redirect(`/fmbReceipt/create?fmbId=${record?.fmbId}&fmbTakhmeenId=${record?.id}`);
              }}
              label="Add Payment"
            />
          )}
        />
      </Datagrid>
    </ReferenceManyField>
  );
};
