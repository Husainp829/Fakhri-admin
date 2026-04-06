import { useEffect, useState } from "react";
import { TextInput, RadioButtonGroupInput } from "react-admin";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button, Typography, Table, TableBody, TableCell, TableRow } from "@mui/material";
import Grid from "@mui/material/Grid";
import HallBookingsItsLookup from "../common/HallBookingsItsLookup";
import { HallBookingsBookingTable } from "./HallBookingsBookingTable";
import { HallBookingsBookingModal } from "./HallBookingsBookingModal";
import { calcBookingTotals } from "@/utils/booking-calculations";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import type { BookingHallLine } from "@/types/booking";

const LabelValue = ({
  label,
  value,
  labelProps = {},
  valueProps = {},
}: {
  label: string;
  value: string | number;
  labelProps?: object;
  valueProps?: object;
}) => (
  <TableRow>
    <TableCell sx={{ width: "50%" }} />
    <TableCell component="th" scope="row" sx={{ paddingRight: 2 }}>
      <Typography variant="body1" color="text.secondary" {...labelProps}>
        {label}
      </Typography>
    </TableCell>
    <TableCell align="right">
      <Typography variant="body1" color="text.primary" {...valueProps}>
        ₹{value}
      </Typography>
    </TableCell>
  </TableRow>
);

export function HallBookingsBookingForm() {
  const { control, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "hallBookings",
  });

  const [open, setOpen] = useState(false);

  const hallBookings = useWatch({ name: "hallBookings" }) as BookingHallLine[] | undefined;
  const rentAmount = useWatch({ name: "rentAmount" }) as number | undefined;
  const kitchenCleaningAmount = useWatch({ name: "kitchenCleaningAmount" }) as number | undefined;
  const depositAmount = useWatch({ name: "depositAmount" }) as number | undefined;
  const jamaatLagat = useWatch({ name: "jamaatLagat" }) as number | undefined;
  const thaalAmount = useWatch({ name: "thaalAmount" }) as number | undefined;

  const mode = useWatch({ name: "mode" }) as string | undefined;
  const jamaatLagatMode = useWatch({ name: "jamaatLagatMode" }) as string | undefined;

  const {
    rentAmount: rent,
    kitchenCleaningAmount: kc,
    depositAmount: deposit,
    thaalCount,
    thaalAmount: thaals,
    totalAmountPending: totalPayable,
  } = calcBookingTotals({
    halls: hallBookings ?? [],
  });

  useEffect(() => {
    if (rentAmount !== rent) {
      setValue("rentAmount", rent);
    }
    if (kc !== kitchenCleaningAmount) {
      setValue("kitchenCleaningAmount", kc);
    }
    if (depositAmount !== deposit) {
      setValue("depositAmount", deposit);
    }
    if (thaalAmount !== thaals) {
      setValue("thaalAmount", thaals);
    }
  }, [
    rent,
    deposit,
    thaals,
    kc,
    rentAmount,
    kitchenCleaningAmount,
    depositAmount,
    thaalAmount,
    setValue,
  ]);

  return (
    <Grid container spacing={1} sx={{ mt: 3 }}>
      <Grid
        sx={{ pr: 1, borderRight: "1px solid #efefef" }}
        size={{
          md: 5,
          xs: 12,
        }}
      >
        <HallBookingsItsLookup />

        <TextInput source="organiser" label="Organiser" fullWidth isRequired sx={{ mt: 3 }} />

        <TextInput source="phone" label="Phone" fullWidth isRequired />

        <TextInput source="mohalla" label="Mohalla" defaultValue="Fakhri Mohalla" fullWidth />
        <TextInput source="sadarat" label="Sadarat" fullWidth />
        <TextInput source="pancard" label="PAN Card" fullWidth />
      </Grid>
      <Grid
        sx={{ pr: 1, mt: -1, textAlign: "right" }}
        size={{
          md: 7,
          xs: 12,
        }}
      >
        <Button variant="outlined" onClick={() => setOpen(true)} size="small">
          Add Hall
        </Button>

        <HallBookingsBookingTable fields={fields} remove={remove} />
        <Table size="small" sx={{ width: "100%", mt: 5 }}>
          <TableBody>
            <LabelValue label="Deposit" value={depositAmount || 0} />
            <LabelValue label="Rent" value={rentAmount || 0} />
            {(thaalAmount ?? 0) > 0 && (
              <LabelValue label={`Thaal (${thaalCount})`} value={thaalAmount || 0} />
            )}

            {(kitchenCleaningAmount ?? 0) > 0 && (
              <LabelValue label="Kitchen Cleaning" value={kitchenCleaningAmount || 0} />
            )}

            {(jamaatLagat ?? 0) > 0 && <LabelValue label="Jamaat Lagat" value={jamaatLagat || 0} />}

            <LabelValue label="Total Payable" value={totalPayable} />
          </TableBody>
        </Table>

        <NoArrowKeyNumberInput
          label="Deposit Amount Paid"
          source="depositPaidAmount"
          fullWidth
          defaultValue={0}
          sx={{ mt: 4.8 }}
          helperText="Accept Deposit Amount In Cash Only"
        />

        <NoArrowKeyNumberInput
          label="Rent Amount Paid"
          source="paidAmount"
          fullWidth
          defaultValue={0}
        />

        <RadioButtonGroupInput
          source="mode"
          choices={[
            { id: "CASH", name: "CASH" },
            { id: "ONLINE", name: "ONLINE" },
            { id: "CHEQUE", name: "CHEQUE" },
          ]}
          sx={{ textAlign: "left" }}
        />
        {mode && mode !== "CASH" && (
          <TextInput source="ref" label="Reference" fullWidth multiline />
        )}

        <NoArrowKeyNumberInput
          label="Jamaat Lagat"
          source="jamaatLagat"
          fullWidth
          defaultValue={0}
        />

        <RadioButtonGroupInput
          source="jamaatLagatMode"
          label="Jamaat Lagat Payment Mode"
          choices={[
            { id: "CASH", name: "CASH" },
            { id: "ONLINE", name: "ONLINE" },
            { id: "CHEQUE", name: "CHEQUE" },
          ]}
          sx={{ textAlign: "left" }}
        />
        {jamaatLagatMode && jamaatLagatMode !== "CASH" && (
          <TextInput source="jamaatLagatRef" label="Jamaat Lagat Reference" fullWidth multiline />
        )}

        <TextInput source="memberReference" label="Jamaat Member Reference" fullWidth multiline />

        <HallBookingsBookingModal
          open={open}
          onClose={() => setOpen(false)}
          append={append}
          hallBookings={fields}
        />
      </Grid>
    </Grid>
  );
}

export default HallBookingsBookingForm;
