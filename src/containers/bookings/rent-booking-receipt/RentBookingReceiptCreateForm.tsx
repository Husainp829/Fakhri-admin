import { useEffect, useMemo } from "react";
import {
  TextInput,
  RadioButtonGroupInput,
  useNotify,
  minValue,
  maxValue,
  required,
} from "react-admin";
import Grid from "@mui/material/Grid";
import { useWatch, useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";
import { callApi } from "@/dataprovider/misc-apis";
import { calcBookingTotals } from "@/utils/booking-calculations";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import type { RaRecord } from "react-admin";
import type { BookingHallLine } from "@/types/booking";

const PaymentFields = ({ pending, type }: { pending: number; type: string }) => {
  const mode = useWatch({ name: "mode" });

  const validateAmount = useMemo(
    () => [
      required(),
      maxValue(pending, `Amount cannot be greater than ${pending}`),
      minValue(1, "Min value is 1"),
    ],
    [pending]
  );

  return (
    <>
      <Grid
        size={{
          lg: 6,
          xs: 12,
        }}
      >
        <TextField value={pending} label="Balance Pending" fullWidth disabled />
      </Grid>
      <Grid
        size={{
          lg: 6,
          xs: 12,
        }}
      >
        <NoArrowKeyNumberInput source="amount" fullWidth validate={validateAmount} />
      </Grid>
      {type === "RENT" && (
        <Grid
          size={{
            lg: 12,
            xs: 12,
          }}
        >
          <RadioButtonGroupInput
            sx={{ mt: 0 }}
            source="mode"
            choices={[
              { id: "CASH", name: "CASH" },
              { id: "ONLINE", name: "ONLINE" },
              { id: "CHEQUE", name: "CHEQUE" },
            ]}
            fullWidth
          />
        </Grid>
      )}
      {mode && mode !== "CASH" && (
        <Grid size={12}>
          <TextInput source="ref" fullWidth multiline />
        </Grid>
      )}
    </>
  );
};

export function RentBookingReceiptCreateForm({ bookingId }: { bookingId: string | null }) {
  const notify = useNotify();
  const { setValue } = useFormContext();

  const type = useWatch({ name: "type" });
  const totalAmountPending = useWatch({ name: "totalAmountPending" }) as number | undefined;
  const totalDepositPending = useWatch({ name: "totalDepositPending" }) as number | undefined;

  const fetchData = async () => {
    if (!bookingId) return;
    try {
      const res = await callApi({ location: "bookings", method: "GET", id: bookingId });
      const body = res.data as { count?: number; rows?: RaRecord[] };
      if ((body.count ?? 0) > 0) {
        const bookingData = (body?.rows?.[0] ?? {}) as RaRecord;
        const hallsRaw = (bookingData.hallBookings as RaRecord[] | undefined) ?? [];
        const halls: BookingHallLine[] = hallsRaw.map((h) => ({
          ...h,
          ...(h.hall as object),
          ...(h.bookingPurpose as object),
        })) as BookingHallLine[];
        const { totalAmountPending: totalAmount, totalDepositPending: totalDeposit } =
          calcBookingTotals({
            halls,
            ...bookingData,
          } as Parameters<typeof calcBookingTotals>[0]);

        setValue("organiser", bookingData.organiser);
        setValue("organiserIts", bookingData.itsNo);
        setValue("totalAmountPending", totalAmount);
        setValue("totalDepositPending", totalDeposit);
        setValue("mode", "CASH");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notify(message);
    }
  };

  useEffect(() => {
    if (!bookingId) return;
    void fetchData();
  }, [bookingId, notify, setValue]);

  return (
    <Grid container spacing={1}>
      <Grid
        size={{
          lg: 6,
          xs: 12,
        }}
      >
        <TextInput source="organiserIts" label="ITS No" fullWidth InputProps={{ readOnly: true }} />
      </Grid>
      <Grid
        size={{
          lg: 6,
          xs: 12,
        }}
      >
        <TextInput source="organiser" label="Organiser" fullWidth InputProps={{ readOnly: true }} />
      </Grid>
      <Grid size={12}>
        <RadioButtonGroupInput
          sx={{ mt: 0 }}
          source="type"
          choices={[
            { id: "DEPOSIT", name: "DEPOSIT" },
            { id: "RENT", name: "CONT" },
          ]}
          fullWidth
        />
      </Grid>
      {type && (
        <PaymentFields
          type={type}
          pending={type === "RENT" ? (totalAmountPending ?? 0) : (totalDepositPending ?? 0)}
        />
      )}
    </Grid>
  );
}

export default RentBookingReceiptCreateForm;
