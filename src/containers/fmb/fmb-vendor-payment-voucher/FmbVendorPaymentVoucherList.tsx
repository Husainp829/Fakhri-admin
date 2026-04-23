import {
  CreateButton,
  Datagrid,
  ExportButton,
  FunctionField,
  List,
  Pagination,
  ReferenceField,
  NumberInput,
  ReferenceInput,
  SelectInput,
  TextField,
  TextInput,
  TopToolbar,
  type ListProps,
  type RaRecord,
} from "react-admin";
import { formatINR } from "@/utils";
import { formatListDate } from "@/utils/date-format";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

const filters = [
  <TextInput
    key="q"
    source="q"
    label="Search voucher, reference, mode, remarks"
    alwaysOn
    sx={{ minWidth: 280 }}
  />,
  <ReferenceInput
    source="fmbVendorId"
    reference="fmbVendor"
    key="fmbVendorId"
    alwaysOn
    perPage={100}
  >
    <SelectInput optionText="name" label="Vendor" />
  </ReferenceInput>,
  <NumberInput source="hijriYearStart" key="hijriYearStart" label="Hijri period (start year)" />,
];

export default function FmbVendorPaymentVoucherList(props: ListProps) {
  return (
    <List
      {...props}
      title="FMB Vendor Payment Vouchers"
      perPage={50}
      sort={{ field: "voucherDate", order: "DESC" }}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      actions={<ListActions />}
      filters={filters}
    >
      <Datagrid bulkActionButtons={false} rowClick="edit">
        <TextField source="voucherNo" label="Voucher no." />
        <TextField source="hijriYearStart" label="Hijri start" />
        <FunctionField
          label="Date"
          source="voucherDate"
          render={(record: RaRecord) =>
            record.voucherDate ? (
              <span>{formatListDate(record.voucherDate as string)}</span>
            ) : (
              <span>—</span>
            )
          }
        />
        <FunctionField
          label="Amount"
          sortBy="amount"
          render={(record: RaRecord) => formatINR(record?.amount, { empty: "—" })}
        />
        <ReferenceField
          source="fmbVendorId"
          reference="fmbVendor"
          label="Vendor"
          link="show"
          sortable={false}
        >
          <TextField source="name" />
        </ReferenceField>
        <TextField source="paymentMode" label="Mode" emptyText="—" />
        <TextField source="referenceNo" label="Reference" emptyText="—" />
      </Datagrid>
    </List>
  );
}
