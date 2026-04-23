import { useEffect, useMemo, useRef } from "react";
import {
  Edit,
  SimpleForm,
  Toolbar,
  SaveButton,
  BooleanInput,
  TextInput,
  useRecordContext,
  usePermissions,
  useRefresh,
  type RaRecord,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { Box, Typography } from "@mui/material";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import { calcBookingTotals } from "@/utils/booking-calculations";
import type { BookingHallLine } from "@/types/booking";
import { hasPermission } from "@/utils/permission-utils";

function flattenHalls(record: RaRecord): BookingHallLine[] {
  const halls = (record.hallBookings as RaRecord[] | undefined) ?? [];
  return halls.map((h) => ({
    ...h,
    ...((h.hall as object) ?? {}),
    ...((h.bookingPurpose as object) ?? {}),
  })) as BookingHallLine[];
}

function InitializeOverrideFromRecord() {
  const { setValue } = useFormContext();
  const r = useRecordContext();
  useEffect(() => {
    if (!r) return;
    const agreed = r.agreedTotalPayable as number | null | undefined;
    const hasAgreed = agreed != null;
    setValue("overrideTotalPayable", hasAgreed, { shouldDirty: false });
  }, [r?.id, r?.agreedTotalPayable, setValue, r]);
  return null;
}

function SeedAgreedToggleFromTariff({ tariff }: { tariff: number }) {
  const { control, setValue, getValues } = useFormContext();
  const overrideOn = useWatch({ control, name: "overrideTotalPayable" });
  const prevOverride = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    const nowOn = overrideOn === true || overrideOn === "true";
    if (prevOverride.current === undefined) {
      prevOverride.current = nowOn;
      return;
    }
    const wasOff = prevOverride.current === false;
    prevOverride.current = nowOn;

    if (!wasOff || !nowOn) return;

    const current = getValues("agreedTotalPayable");
    if (current === undefined || current === null || current === "" || Number(current) === 0) {
      setValue("agreedTotalPayable", tariff, { shouldDirty: false, shouldTouch: false });
    }
  }, [overrideOn, tariff, getValues, setValue]);

  return null;
}

function AgreedTariffDisclaimer({ tariff }: { tariff: number }) {
  const overrideOn = useWatch({ name: "overrideTotalPayable" });
  const agreedRaw = useWatch({ name: "agreedTotalPayable" });
  const on = overrideOn === true || overrideOn === "true";
  if (!on) return null;
  const agreed = Math.round(Number(agreedRaw) || 0);
  const waived = tariff - agreed;
  if (waived <= 0) return null;
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      Taking ₹{waived} less than calculated hall tariff (₹{tariff}).
    </Typography>
  );
}

const isOverrideOn = (values: Record<string, unknown>) =>
  values.overrideTotalPayable === true || values.overrideTotalPayable === "true";

const validateAgreedTotal = (values: Record<string, unknown>) => {
  const errors: Record<string, string> = {};
  if (isOverrideOn(values)) {
    const remarks = String(values.remarks ?? "").trim();
    if (!remarks) {
      errors.remarks =
        "Booking remarks are required when using an agreed total that differs from calculated";
    }
    const n = Number(values.agreedTotalPayable);
    if (!Number.isFinite(n) || n < 0) {
      errors.agreedTotalPayable = "Enter a valid agreed total";
    }
  }
  return errors;
};

const transformAgreedTotalPayload = (values: Record<string, unknown>) => {
  const override = isOverrideOn(values);
  const remarksTrim = typeof values.remarks === "string" ? values.remarks.trim() : "";
  if (!override) {
    return {
      agreedTotalPayable: null as number | null,
      remarks: remarksTrim || null,
    };
  }
  return {
    agreedTotalPayable: Math.round(Number(values.agreedTotalPayable) || 0),
    remarks: remarksTrim || null,
  };
};

function AgreedAmountFields({ tariff }: { tariff: number }) {
  const overrideOn = useWatch({ name: "overrideTotalPayable" });
  const on = overrideOn === true || overrideOn === "true";
  if (!on) return null;
  return (
    <>
      <NoArrowKeyNumberInput label="Agreed total payable" source="agreedTotalPayable" fullWidth />
      <AgreedTariffDisclaimer tariff={tariff} />
    </>
  );
}

export function HallBookingsBookingAgreedTotalEdit() {
  const record = useRecordContext();
  const { permissions } = usePermissions();
  const refresh = useRefresh();

  const tariff = useMemo(() => {
    if (!record) return 0;
    return calcBookingTotals({ halls: flattenHalls(record) }).totalAmountPending;
  }, [record]);

  if (!record?.id || !hasPermission(permissions, "bookings.edit")) {
    return null;
  }
  if (record.checkedOutOn) {
    return null;
  }

  return (
    <Box sx={{ mb: 4, maxWidth: 560 }}>
      <Typography variant="subtitle1" gutterBottom>
        Agreed contribution total
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Override the hall-line total when a different agreed amount applies (e.g. khidmat rate).
        Calculated hall tariff: ₹{tariff}.
      </Typography>
      <Edit
        resource="bookings"
        id={String(record.id)}
        mutationMode="pessimistic"
        redirect={false}
        actions={false}
        transform={transformAgreedTotalPayload}
        mutationOptions={{
          onSuccess: () => {
            refresh();
          },
        }}
      >
        <SimpleForm
          toolbar={
            <Toolbar>
              <SaveButton />
            </Toolbar>
          }
          validate={validateAgreedTotal}
        >
          <InitializeOverrideFromRecord />
          <BooleanInput
            source="overrideTotalPayable"
            label="Agreed total differs from calculated hall tariff"
          />
          <SeedAgreedToggleFromTariff tariff={tariff} />
          <TextInput
            source="remarks"
            label="Booking remarks"
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 1 }}
            helperText="Optional. Required when an agreed override is enabled."
          />
          <AgreedAmountFields tariff={tariff} />
        </SimpleForm>
      </Edit>
    </Box>
  );
}

export default HallBookingsBookingAgreedTotalEdit;
