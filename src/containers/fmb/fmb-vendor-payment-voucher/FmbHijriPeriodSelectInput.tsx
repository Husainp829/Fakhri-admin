import { useEffect, useState } from "react";
import { SelectInput } from "react-admin";
import { useFormContext } from "react-hook-form";
import { callApi } from "@/dataprovider/misc-apis";

type PeriodRow = { hijriYearStart: number; label: string };

/**
 * Loads FMB dashboard periods (same source as the FMB dashboard) so vouchers align with takhmeen Hijri years.
 */
export default function FmbHijriPeriodSelectInput() {
  const { setValue } = useFormContext();
  const [choices, setChoices] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await callApi({
          location: "fmbVendorPaymentVoucher",
          method: "GET",
          id: "hijri-periods",
        });
        const periods = (res?.data as { periods?: PeriodRow[] } | undefined)?.periods ?? [];
        const next = periods.map((p) => ({ id: p.hijriYearStart, name: p.label }));
        if (!cancelled) {
          setChoices(next);
          if (next.length === 1) {
            setValue("hijriYearStart", next[0].id, { shouldValidate: true });
          }
        }
      } catch {
        if (!cancelled) {
          setChoices([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setValue]);

  return (
    <SelectInput
      source="hijriYearStart"
      label="FMB period (Hijri)"
      choices={choices}
      optionText="name"
      optionValue="id"
      isRequired
      disabled={loading || choices.length === 0}
      helperText={
        choices.length === 0 && !loading
          ? "No periods yet. Add FMB takhmeen or contributions with a Hijri year first."
          : undefined
      }
    />
  );
}
