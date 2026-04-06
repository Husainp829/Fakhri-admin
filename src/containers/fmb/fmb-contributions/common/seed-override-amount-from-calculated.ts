import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";

/**
 * When the user turns on "Override total amount", prefill `amount` with the
 * current calculated total (quantity × unitAmount). Does not run on initial
 * mount (so edit records keep their saved override amount).
 */
export function SeedOverrideAmountFromCalculated() {
  const { control, setValue, getValues } = useFormContext();
  const isOverride = useWatch({ control, name: "isAmountOverridden" });
  const prevOverride = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    const nowOn = isOverride === true || isOverride === "true";
    if (prevOverride.current === undefined) {
      prevOverride.current = nowOn;
      return;
    }
    const wasOff = prevOverride.current === false;
    prevOverride.current = nowOn;

    if (!wasOff || !nowOn) return;

    const q = Number(getValues("quantity")) || 0;
    const u = Number(getValues("unitAmount")) || 0;
    const calculated = q * u;
    if (calculated > 0) {
      setValue("amount", calculated, { shouldDirty: false, shouldTouch: false });
    }
  }, [isOverride, getValues, setValue]);

  return null;
}
