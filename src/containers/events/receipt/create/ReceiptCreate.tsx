import { Create, SimpleForm, type CreateProps } from "react-admin";
import { ReceiptCreateForm } from "./ReceiptCreateForm";
import { useRouteId } from "@/utils/route-utility";

export const ReceiptCreate = (props: CreateProps) => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params ?? "");
  const niyaazId = searchParams.get("niyaazId");
  const eventId = useRouteId();

  const transform = (data: Record<string, unknown>) => ({
    eventId: data.eventId,
    niyaazId: data.niyaazId,
    formNo: data.formNo,
    amount: data.amount,
    mode: data.mode,
    details: data.details,
    markaz: data.markaz,
    namaazVenue: data.namaazVenue,
    HOFId: data.HOFId,
    HOFName: data.HOFName,
  });

  const validateReceiptCreation = (values: Record<string, unknown>) => {
    const errors: Record<string, string> = {};
    if (!values.markaz) {
      errors.markaz = "The markaz is required";
    }
    if (!values.namaazVenue) {
      errors.namaazVenue = "The namaaz venue is required";
    }
    if (!values.HOFId) {
      errors.markaz = "The HOF ITS is required";
    }
    if (!values.HOFName) {
      errors.markaz = "The HOF Name is required";
    }

    if (!values.mode) {
      errors.mode = "Payment Mode is Required";
    }
    const totalPayable = Number(values.totalPayable);
    const paidAmount = Number(values.paidAmount);
    const amount = Number(values.amount);
    const remaining = totalPayable - paidAmount;
    if (amount > remaining) {
      errors.amount = "Payment Amount cannot be greater than Payable";
    }

    return errors;
  };

  const receiptDefaultValues = () => ({ niyaazId, eventId });

  return (
    <Create {...props} transform={transform} redirect={() => `niyaaz/${niyaazId}/show/receipts`}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
        validate={validateReceiptCreation}
      >
        <ReceiptCreateForm niyaazId={niyaazId} />
      </SimpleForm>
    </Create>
  );
};
