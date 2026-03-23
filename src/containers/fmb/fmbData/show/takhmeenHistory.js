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
import { formatFmbHijriPeriod } from "../../../../utils/hijriDateUtils";

export default () => {
  const redirect = useRedirect();

  return (
    <ReferenceManyField reference="fmbTakhmeen" target="fmbId" label={false}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <TextField source="takhmeenAmount" />
        <FunctionField
          label="Hijri period"
          source="takhmeenYear"
          render={(record) =>
            formatFmbHijriPeriod(
              record?.hijriYearStart ?? record?.takhmeenYear,
              record?.hijriYearEnd,
            ) ?? "—"
          }
        />
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
              type="button"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
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
