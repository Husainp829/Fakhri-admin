import type { EditProps } from "react-admin";
import {
  Edit,
  SimpleForm,
  DateInput,
  DeleteButton,
  Toolbar,
  SaveButton,
  ReferenceInput,
  SelectInput,
  TextInput,
} from "react-admin";
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

const CustomToolbar = () => (
  <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
    <SaveButton />
    <DeleteButton mutationMode="pessimistic" />
  </Toolbar>
);

const RazaRequestsEdit = (props: EditProps) => (
  <Edit {...props} transform={transform} mutationMode="pessimistic">
    <SimpleForm warnWhenUnsavedChanges toolbar={<CustomToolbar />} sx={{ maxWidth: 700 }}>
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
  </Edit>
);

export default RazaRequestsEdit;
