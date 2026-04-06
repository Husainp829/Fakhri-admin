import { Create, SimpleForm, type CreateProps } from "react-admin";

import { RentBookingReceiptCreateForm } from "./RentBookingReceiptCreateForm";

const getBookingIdFromLocation = (): string | null => {
  if (typeof window === "undefined") return null;
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  return searchParams.get("bookingId");
};

export const RentBookingReceiptCreate = (props: CreateProps) => {
  const bookingId = getBookingIdFromLocation();

  const transform = (data: Record<string, unknown>) => ({
    type: data.type,
    organiser: data.organiser,
    organiserIts: data.organiserIts,
    bookingId: data.bookingId,
    amount: data.amount,
    mode: data.mode,
    ref: data.ref,
  });

  const validateReceiptCreation = (values: Record<string, unknown>) => {
    const errors: Record<string, string> = {};

    if (!values.organiserIts) {
      errors.organiserIts = "The ITS is required";
    }
    if (!values.organiser) {
      errors.organiser = "The organiser name is required";
    }

    if (!values.type) {
      errors.type = "Type is Required";
    }

    if (!values.mode) {
      errors.mode = "Payment Mode is Required";
    }
    const totalAmountPending = Number(values.totalAmountPending || 0);
    const totalDepositPending = Number(values.totalDepositPending || 0);
    if (!values.amount) {
      errors.amount = "Payment Amount is required";
    } else if (values.type === "DEPOSIT" && Number(values.amount) > totalDepositPending) {
      errors.amount = "Payment Amount cannot be greater than Deposit Pending";
    } else if (values.type === "RENT" && Number(values.amount) > totalAmountPending) {
      errors.amount = "Payment Amount cannot be greater than Cont Pending";
    }

    return errors;
  };

  const receiptDefaultValues = () => ({ bookingId });

  return (
    <Create
      {...props}
      transform={transform}
      redirect={() => `bookings/${bookingId ?? ""}/show/receipts`}
    >
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={receiptDefaultValues}
        validate={validateReceiptCreation}
      >
        <RentBookingReceiptCreateForm bookingId={bookingId} />
      </SimpleForm>
    </Create>
  );
};

export default RentBookingReceiptCreate;
