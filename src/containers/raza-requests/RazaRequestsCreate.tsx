import type { CreateProps } from "react-admin";
import { Create, SimpleForm, DateInput, ReferenceInput, SelectInput, TextInput } from "react-admin";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import PaymentModeInput from "@/containers/lagat-receipt/common/PaymentModeInput";
import RazaItsLookup from "./common/RazaItsLookup";

const transform = (data: Record<string, unknown>) => {
  const requestDateRaw = data.requestDate;
  const requestDate =
    requestDateRaw instanceof Date ? requestDateRaw : new Date(String(requestDateRaw ?? ""));
  const payload: Record<string, unknown> = {
    purpose: data.purpose,
    amount: Number(data.amount),
    itsNo: data.itsNo,
    name: data.name,
    address: data.address,
    paymentMode: data.paymentMode ?? "CASH",
    paymentRef: data.paymentRef ?? undefined,
  };
  if (!Number.isNaN(requestDate.getTime())) {
    payload.requestDate = requestDate.toISOString();
  }
  return payload;
};

const defaultValues = () => ({
  requestDate: new Date(),
  paymentMode: "CASH",
});

const RazaRequestsCreate = (props: CreateProps) => (
  <Create {...props} transform={transform} redirect="show">
    <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }} defaultValues={defaultValues}>
      <RazaItsLookup source="itsNo" label="ITS no." fullWidth required />
      <TextInput source="name" label="Name" fullWidth required />
      <TextInput source="address" label="Address" fullWidth multiline required />
      <ReferenceInput
        source="purpose"
        reference="bookingPurpose"
        label="Purpose"
        fullWidth
        required
      >
        <SelectInput optionText="name" optionValue="id" fullWidth />
      </ReferenceInput>
      <DateInput source="requestDate" label="Request date" fullWidth required />
      <NoArrowKeyNumberInput source="amount" label="Lagat amount" fullWidth required />
      <PaymentModeInput />
    </SimpleForm>
  </Create>
);

export default RazaRequestsCreate;
