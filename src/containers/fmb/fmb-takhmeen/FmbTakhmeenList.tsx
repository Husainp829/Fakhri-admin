import React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  TopToolbar,
  CreateButton,
  Pagination,
  FunctionField,
  type ListProps,
} from "react-admin";
import { formatINR } from "@/utils";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

export default function FmbTakhmeenList(props: ListProps) {
  return (
    <List
      {...props}
      actions={<ListActions />}
      sort={{ field: "startDate", order: "DESC" }}
      perPage={25}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ReferenceField source="fmbId" reference="fmbData" link="show" label="File no.">
          <TextField source="fileNo" />
        </ReferenceField>
        <ReferenceField source="fmbId" reference="fmbData" link="show" label="ITS">
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          label="Amount"
          textAlign="right"
          render={(record) => formatINR(record?.takhmeenAmount, { empty: "—" })}
        />
        <FunctionField
          label="Pending"
          textAlign="right"
          render={(record) => formatINR(record?.pendingBalance, { empty: "—" })}
        />
        <FunctionField
          label="Paid"
          textAlign="right"
          render={(record) => formatINR(record?.paidBalance, { empty: "—" })}
        />
        <FunctionField
          label="Hijri period"
          render={(record) =>
            formatFmbHijriPeriod(record?.hijriYearStart, record?.hijriYearEnd) ?? "—"
          }
        />
        <DateField source="startDate" label="Effective" emptyText="—" />
        <DateField source="createdAt" label="Created" emptyText="—" />
      </Datagrid>
    </List>
  );
}
