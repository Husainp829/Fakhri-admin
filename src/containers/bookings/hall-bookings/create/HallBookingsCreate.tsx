import { Create, useNotify, SimpleForm, useRedirect, type RaRecord } from "react-admin";
import { HallBookingsBookingForm } from "./HallBookingsBookingForm";

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
      mutationOptions={{
        onSuccess,
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          notify(`Could not create booking: ${message}`, { type: "error" });
        },
      }}
    >
      <SimpleForm warnWhenUnsavedChanges validate={validateBookingCreation}>
        <HallBookingsBookingForm />
      </SimpleForm>
    </Create>
  );
};

export default HallBookingsCreate;
