import React from "react";
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  TopToolbar,
  CreateButton,
  Pagination,
  FunctionField,
  TextInput,
  type ListProps,
  type RaRecord,
} from "react-admin";
import { formatINR } from "@/utils";
import { formatDisplayDateTime, formatListDate } from "@/utils/date-format";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

const filters = [
  <TextInput
    key="q"
    source="q"
    label="Search file no., ITS, or household name"
    alwaysOn
    sx={{ minWidth: 300 }}
  />,
];

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
      filters={filters}
      perPage={25}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
    >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <ReferenceField source="fmbId" reference="fmbData" link="show" label="ITS" sortable={false}>
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          label="Amount"
          textAlign="right"
          sortBy="takhmeenAmount"
          render={(record) => formatINR(record?.takhmeenAmount, { empty: "—" })}
        />
        <FunctionField
          label="Pending"
          textAlign="right"
          sortBy="pendingBalance"
          render={(record) => formatINR(record?.pendingBalance, { empty: "—" })}
        />
        <FunctionField
          label="Paid"
          textAlign="right"
          sortBy="paidBalance"
          render={(record) => formatINR(record?.paidBalance, { empty: "—" })}
        />
        <FunctionField
          label="Hijri period"
          sortBy="hijriYearStart"
          render={(record: RaRecord) =>
            formatFmbHijriPeriod(record?.hijriYearStart, record?.hijriYearEnd) ?? "—"
          }
        />
        <FunctionField
          label="Effective"
          sortBy="startDate"
          render={(record: RaRecord) => formatListDate(record?.startDate, { empty: "—" })}
        />
        <FunctionField
          label="Created"
          sortBy="createdAt"
          render={(record: RaRecord) => formatDisplayDateTime(record?.createdAt, { empty: "—" })}
        />
      </Datagrid>
    </List>
  );
}
