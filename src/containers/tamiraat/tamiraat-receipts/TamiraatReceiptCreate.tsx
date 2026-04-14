import type { CreateProps } from "react-admin";
import { useFormContext } from "react-hook-form";
import { Create, SimpleForm, TextInput, DateInput, SelectInput } from "react-admin";
import MiqaatNiyaazItLookup from "@/containers/miqaat/miqaat-niyaaz-receipts/common/MiqaatNiyaazItLookup";
import MiqaatNiyaazPaymentModeInput from "@/containers/miqaat/miqaat-niyaaz-receipts/common/MiqaatNiyaazPaymentModeInput";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

const ReceiptTypeDependentFields = () => {
  const { watch } = useFormContext();
  const receiptType = watch("receiptType");

  return (
    <>
      {receiptType === "CREDIT" && <MiqaatNiyaazItLookup />}
      <TextInput source="name" label="Name" fullWidth isRequired />
      {receiptType === "DEBIT" && (
        <TextInput source="itsNo" label="ITS No (Optional - for external vendors)" fullWidth />
      )}
    </>
  );
};

const TamiraatReceiptCreate = (props: CreateProps) => {
  const transform = (data: Record<string, unknown>) => ({
    receiptType: data.receiptType,
    itsNo: data.itsNo || null,
    name: data.name,
    purpose: data.purpose,
    amount: data.amount,
    receiptDate: data.receiptDate,
    paymentMode: data.paymentMode || null,
    paymentRef: data.paymentRef || null,
    remarks: data.remarks || null,
  });

  const receiptDefaultValues = (): Record<string, unknown> => ({
    receiptDate: new Date(),
    receiptType: "DEBIT",
  });

  return (
    <Create {...props} transform={transform} redirect="/">
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
      >
        <SelectInput
          source="receiptType"
          label="Entry Type"
          choices={[
            { id: "CREDIT", name: "CREDIT (Income)" },
            { id: "DEBIT", name: "DEBIT (Expense)" },
          ]}
          fullWidth
          isRequired
        />
        <ReceiptTypeDependentFields />
        <TextInput source="purpose" label="Purpose" fullWidth isRequired />
        <NoArrowKeyNumberInput source="amount" label="Amount" fullWidth isRequired />
        <DateInput source="receiptDate" label="Receipt Date" fullWidth isRequired />
        <MiqaatNiyaazPaymentModeInput />
        <TextInput source="remarks" label="Remarks" fullWidth multiline rows={3} />
      </SimpleForm>
    </Create>
  );
};

export default TamiraatReceiptCreate;
