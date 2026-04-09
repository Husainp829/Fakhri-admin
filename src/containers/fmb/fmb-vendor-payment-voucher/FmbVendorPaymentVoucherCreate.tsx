import {
  Create,
  DateInput,
  RadioButtonGroupInput,
  SimpleForm,
  TextInput,
  type CreateProps,
} from "react-admin";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import CustomReferenceInput from "@/components/CustomReferenceInput";
import FmbHijriPeriodSelectInput from "./FmbHijriPeriodSelectInput";

export default function FmbVendorPaymentVoucherCreate(props: CreateProps) {
  return (
    <Create {...props} redirect="list" sx={{ mt: 2 }}>
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 520 }}>
        <CustomReferenceInput
          source="fmbVendorId"
          reference="fmbVendor"
          perPage={200}
          optionText="name"
          fields={[
            { source: "name", label: "Name" },
            { source: "mobile", label: "Mobile" },
          ]}
          defaultKey="name"
          title="FMB vendor"
          isRequired
        />
        <FmbHijriPeriodSelectInput />
        <DateInput source="voucherDate" label="Voucher date" isRequired fullWidth />
        <NoArrowKeyNumberInput source="amount" label="Amount" fullWidth isRequired />
        <RadioButtonGroupInput
          source="paymentMode"
          label="Payment mode"
          choices={[
            { id: "CASH", name: "Cash" },
            { id: "ONLINE", name: "Online" },
            { id: "CHEQUE", name: "Cheque" },
          ]}
          fullWidth
        />
        <TextInput source="referenceNo" label="Bill / reference no." fullWidth />
        <TextInput source="remarks" label="Remarks" fullWidth multiline minRows={2} />
      </SimpleForm>
    </Create>
  );
}
