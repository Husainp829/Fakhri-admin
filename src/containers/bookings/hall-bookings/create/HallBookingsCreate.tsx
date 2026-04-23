import { Create, useNotify, SimpleForm, useRedirect, type RaRecord } from "react-admin";
import { HallBookingsBookingForm } from "./HallBookingsBookingForm";

const isTotalOverrideOn = (values: Record<string, unknown>) =>
  values.overrideTotalPayable === true || values.overrideTotalPayable === "true";

const transformBookingCreate = (values: Record<string, unknown>) => {
  const {
    overrideTotalPayable: _o,
    overriddenTotalPayable: _ot,
    remarks: remarksRaw,
    ...rest
  } = values;

  const remarksTrim = String(remarksRaw ?? "").trim();
  const base: Record<string, unknown> = {
    ...rest,
    ...(remarksTrim ? { remarks: remarksTrim } : {}),
  };

  if (!isTotalOverrideOn(values)) {
    return base;
  }

  const over = Math.round(Number(values.overriddenTotalPayable) || 0);
  return {
    ...base,
    agreedTotalPayable: over,
  };
};

export const HallBookingsCreate = (props: Parameters<typeof Create>[0]) => {
  const notify = useNotify();
  const redirect = useRedirect();

  const validateBookingCreation = (values: Record<string, unknown>) => {
    const errors: Record<string, string> = {};
    if (!values.organiser) {
      errors.organiser = "The organiser is required";
    }
    if (!values.phone) {
      errors.phone = "The phone number is required";
    }
    if (!values.itsNo) {
      errors.itsNo = "The ITS is required";
    }

    if (isTotalOverrideOn(values)) {
      const remarks = String(values.remarks ?? "").trim();
      if (!remarks) {
        errors.remarks =
          "Add booking remarks when using an agreed total that differs from calculated (e.g. khidmat rate)";
      }
      const over = Number(values.overriddenTotalPayable);
      if (!Number.isFinite(over) || over < 0) {
        errors.overriddenTotalPayable = "Enter a valid total amount";
      }
    }

    return errors;
  };

  const onSuccess = (data: RaRecord) => {
    notify(`Booking created - ${data.id}`, { autoHideDuration: 5000, type: "success" });
    redirect(`/bookings/${data.id}/show`);
  };

  return (
    <Create
      {...props}
      redirect="list"
      transform={transformBookingCreate}
      mutationOptions={{
        onSuccess,
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          notify(`Could not create booking: ${message}`, { type: "error" });
        },
      }}
    >
      <SimpleForm
        warnWhenUnsavedChanges
        validate={validateBookingCreation}
        defaultValues={{
          overrideTotalPayable: false,
        }}
      >
        <HallBookingsBookingForm />
      </SimpleForm>
    </Create>
  );
};

export default HallBookingsCreate;
