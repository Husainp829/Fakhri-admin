import type { ShowProps, RaRecord } from "react-admin";
import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  FunctionField,
  ReferenceField,
  useShowContext,
} from "react-admin";
import { formatDisplayDateTime, formatListDate } from "@/utils/date-format";

const WriteoffInfo = () => {
  const { record } = useShowContext<RaRecord>();
  if (record?.status !== "WRITTEN_OFF") {
    return null;
  }

  return (
    <>
      <NumberField
        source="writeoffAmount"
        label="Writeoff Amount"
        options={{ style: "currency", currency: "INR" }}
      />
      <TextField source="writeoffAuthorizedBy" label="Authorized By" />
      <FunctionField
        label="Writeoff Date"
        render={(rec: RaRecord) => formatListDate(rec?.writeoffDate, { empty: "—" })}
      />
    </>
  );
};

const SabilLedgerShow = (props: ShowProps) => (
  <Show {...props}>
    <SimpleShowLayout>
      <ReferenceField source="sabilId" reference="sabilData">
        <TextField source="sabilNo" label="Sabil No." />
      </ReferenceField>
      <ReferenceField source="sabilId" reference="sabilData">
        <TextField source="sabilType" label="Sabil Type" />
      </ReferenceField>
      <TextField source="month" label="Month" />
      <TextField source="year" label="Year" />
      <TextField source="financialYear" label="Financial Year" />
      <NumberField
        source="dueAmount"
        label="Due Amount"
        options={{ style: "currency", currency: "INR" }}
      />
      <NumberField
        source="paidAmount"
        label="Paid Amount"
        options={{ style: "currency", currency: "INR" }}
      />
      <NumberField
        source="openingBalance"
        label="Opening Balance"
        options={{ style: "currency", currency: "INR" }}
      />
      <FunctionField
        label="Status"
        render={(rec: RaRecord) => {
          if (rec.status === "WRITTEN_OFF") return "Written Off";
          if (rec.status === "FULLY_PAID") return "Fully Paid";
          if (rec.status === "PARTIALLY_PAID") return "Partially Paid";
          return "Unpaid";
        }}
      />
      <WriteoffInfo />
      <ReferenceField source="receiptId" reference="sabilReceipt" label="Receipt">
        <TextField source="receiptNo" />
      </ReferenceField>
      <FunctionField
        label="Created At"
        render={(rec: RaRecord) => formatDisplayDateTime(rec?.createdAt, { empty: "—" })}
      />
      <FunctionField
        label="Updated At"
        render={(rec: RaRecord) => formatDisplayDateTime(rec?.updatedAt, { empty: "—" })}
      />
    </SimpleShowLayout>
  </Show>
);

export default SabilLedgerShow;
