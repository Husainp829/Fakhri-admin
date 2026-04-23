import React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  ReferenceField,
  ReferenceManyField,
  Datagrid,
  TopToolbar,
  ListButton,
  EditButton,
  FunctionField,
  type ShowProps,
  type RaRecord,
} from "react-admin";
import { formatDisplayDateTime, formatListDate } from "@/utils/date-format";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

const FmbTakhmeenShowActions = () => (
  <TopToolbar>
    <ListButton />
    <EditButton />
  </TopToolbar>
);

export default function FmbTakhmeenShow(props: ShowProps) {
  return (
    <Show {...props} actions={<FmbTakhmeenShowActions />}>
      <SimpleShowLayout>
        <ReferenceField source="fmbId" reference="fmbData" link="show" label="FMB record">
          <TextField source="fileNo" />
        </ReferenceField>
        <NumberField source="takhmeenAmount" label="Takhmeen amount" />
        <NumberField source="pendingBalance" label="Pending balance" />
        <NumberField source="paidBalance" label="Paid balance" />
        <FunctionField
          label="Hijri period"
          render={(record) =>
            formatFmbHijriPeriod(record?.hijriYearStart, record?.hijriYearEnd) ?? "—"
          }
        />
        <FunctionField
          label="Effective from"
          render={(record) => formatListDate(record?.startDate, { empty: "—" })}
        />
        <FunctionField
          label="Created"
          render={(record) => formatDisplayDateTime(record?.createdAt, { empty: "—" })}
        />
        <FunctionField
          label="Updated"
          render={(record) => formatDisplayDateTime(record?.updatedAt, { empty: "—" })}
        />
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
            <FunctionField
              label="Receipt date"
              sortBy="receiptDate"
              render={(record: RaRecord) => formatListDate(record?.receiptDate, { empty: "—" })}
            />
            <TextField source="paymentMode" emptyText="—" />
          </Datagrid>
        </ReferenceManyField>
      </SimpleShowLayout>
    </Show>
  );
}
