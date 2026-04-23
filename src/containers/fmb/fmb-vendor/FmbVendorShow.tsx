import {
  Datagrid,
  FunctionField,
  ReferenceManyField,
  Show,
  SimpleShowLayout,
  TextField,
  type RaRecord,
  type ShowProps,
} from "react-admin";
import { formatINR } from "@/utils";
import { formatListDate } from "@/utils/date-format";

export default function FmbVendorShow(props: ShowProps) {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <TextField source="name" label="Vendor name" />
        <TextField source="mobile" label="Mobile" emptyText="—" />
        <TextField source="remarks" label="Remarks" emptyText="—" />
        <ReferenceManyField
          label="Payment vouchers"
          reference="fmbVendorPaymentVoucher"
          target="fmbVendorId"
          sort={{ field: "voucherDate", order: "DESC" }}
          perPage={25}
        >
          <Datagrid bulkActionButtons={false} rowClick="edit">
            <TextField source="voucherNo" label="Voucher no." />
            <TextField source="hijriYearStart" label="Hijri start" />
            <FunctionField
              label="Date"
              sortBy="voucherDate"
              render={(record: RaRecord) => formatListDate(record?.voucherDate, { empty: "—" })}
            />
            <FunctionField
              label="Amount"
              render={(record: RaRecord) => formatINR(record?.amount, { empty: "—" })}
            />
            <TextField source="paymentMode" label="Mode" emptyText="—" />
            <TextField source="referenceNo" label="Reference" emptyText="—" />
          </Datagrid>
        </ReferenceManyField>
      </SimpleShowLayout>
    </Show>
  );
}
