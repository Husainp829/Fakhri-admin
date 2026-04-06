import type { CreateProps } from "react-admin";
import { TextInput, Create, SimpleForm, ReferenceInput, SelectInput } from "react-admin";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

import LagatItsLookup from "./common/LagatItsLookup";
import PaymentModeInput from "./common/PaymentModeInput";

const LagatReceiptCreate = (props: CreateProps) => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const bookingId = searchParams.get("bookingId");

  const transform = (data: Record<string, unknown>) => ({
    referenceId: bookingId,
    itsNo: data.itsNo,
    name: data.name,
    amount: data.amount,
    paymentMode: data.paymentMode,
    paymentRef: data.paymentRef,
    remarks: data.remarks,
    purpose: data.purpose,
  });

  const receiptDefaultValues = () => ({});
  return (
    <Create {...props} transform={transform}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
      >
        <LagatItsLookup />
        <TextInput source="name" label="Name" fullWidth />
        <ReferenceInput source="purpose" reference="bookingPurpose" required>
          <SelectInput fullWidth label="Purpose" />
        </ReferenceInput>
        <NoArrowKeyNumberInput source="amount" fullWidth />

        <PaymentModeInput />
        <TextInput source="remarks" fullWidth />
      </SimpleForm>
    </Create>
  );
};

export default LagatReceiptCreate;
