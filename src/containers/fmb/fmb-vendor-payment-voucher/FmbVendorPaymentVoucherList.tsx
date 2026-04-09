import {
  CreateButton,
  Datagrid,
  DateField,
  ExportButton,
  FunctionField,
  List,
  Pagination,
  ReferenceField,
  NumberInput,
  ReferenceInput,
  SelectInput,
  TextField,
  TopToolbar,
  type ListProps,
  type RaRecord,
} from "react-admin";
import { formatINR } from "@/utils";

const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

const filters = [
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
        <DateField source="voucherDate" label="Date" />
        <FunctionField
          label="Amount"
          render={(record: RaRecord) => formatINR(record?.amount, { empty: "—" })}
        />
        <ReferenceField source="fmbVendorId" reference="fmbVendor" label="Vendor" link="show">
          <TextField source="name" />
        </ReferenceField>
        <TextField source="paymentMode" label="Mode" emptyText="—" />
        <TextField source="referenceNo" label="Reference" emptyText="—" />
      </Datagrid>
    </List>
  );
}
