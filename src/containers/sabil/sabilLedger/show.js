import React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  NumberField,
  DateField,
  FunctionField,
  ReferenceField,
  useShowContext,
} from "react-admin";

const WriteoffInfo = () => {
  const { record } = useShowContext();
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
      <DateField source="writeoffDate" label="Writeoff Date" />
    </>
  );
};

export default (props) => (
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
        render={(record) => {
          if (record.status === "WRITTEN_OFF") return "Written Off";
          if (record.status === "FULLY_PAID") return "Fully Paid";
          if (record.status === "PARTIALLY_PAID") return "Partially Paid";
          return "Unpaid";
        }}
      />
      <WriteoffInfo />
      <ReferenceField source="receiptId" reference="sabilReceipt" label="Receipt">
        <TextField source="receiptNo" />
      </ReferenceField>
      <DateField source="createdAt" label="Created At" />
      <DateField source="updatedAt" label="Updated At" />
    </SimpleShowLayout>
  </Show>
);
