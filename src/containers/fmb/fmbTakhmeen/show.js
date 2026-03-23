import React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  DateField,
  ReferenceField,
  ReferenceManyField,
  Datagrid,
  TopToolbar,
  ListButton,
  EditButton,
  FunctionField,
} from "react-admin";
import { formatFmbHijriPeriod } from "../../../utils/hijriDateUtils";

const FmbTakhmeenShowActions = () => (
  <TopToolbar>
    <ListButton />
    <EditButton />
  </TopToolbar>
);

export default function FmbTakhmeenShow(props) {
  return (
    <Show {...props} actions={<FmbTakhmeenShowActions />}>
      <SimpleShowLayout>
        <ReferenceField source="fmbId" reference="fmbData" link="show" label="FMB record">
          <TextField source="fmbNo" />
        </ReferenceField>
        <TextField source="category" label="Category" />
        <NumberField source="takhmeenAmount" label="Takhmeen amount" />
        <NumberField source="pendingBalance" label="Pending balance" />
        <NumberField source="paidBalance" label="Paid balance" />
        <FunctionField
          label="Hijri period"
          render={(record) =>
            formatFmbHijriPeriod(
              record?.hijriYearStart ?? record?.takhmeenYear,
              record?.hijriYearEnd,
            ) ?? "—"
          }
        />
        <DateField source="shawwalStartDate" label="1 Shawwal (Gregorian)" emptyText="—" />
        <DateField source="startDate" label="Effective from" emptyText="—" />
        <DateField source="createdAt" label="Created" showTime />
        <DateField source="updatedAt" label="Updated" showTime />
        <ReferenceField
          source="updatedBy"
          reference="admins"
          link={false}
          label="Updated by"
          emptyText="—"
        >
          <TextField source="name" />
        </ReferenceField>

        <ReferenceManyField
          reference="fmbReceipt"
          target="fmbTakhmeenId"
          label="Receipts for this period"
          perPage={25}
          sort={{ field: "receiptDate", order: "DESC" }}
        >
          <Datagrid bulkActionButtons={false} rowClick="show">
            <TextField source="receiptNo" label="Receipt no." emptyText="—" />
            <NumberField source="amount" />
            <DateField source="receiptDate" emptyText="—" />
            <TextField source="paymentMode" emptyText="—" />
          </Datagrid>
        </ReferenceManyField>
      </SimpleShowLayout>
    </Show>
  );
}
