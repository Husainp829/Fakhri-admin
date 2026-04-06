import { useEffect } from "react";
import { AutocompleteInput, useChoicesContext, type AutocompleteInputProps } from "react-admin";
import { useFormContext } from "react-hook-form";

function itsField(choice: Record<string, unknown> | null | undefined, field: string): unknown {
  if (!choice) return null;
  const nested = choice.itsdata as Record<string, unknown> | undefined;
  if (nested != null && nested[field] != null && nested[field] !== "") {
    return nested[field];
  }
  return choice[field] ?? null;
}

function normalizeString(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

/** Choice is either a hydrated fmbData row (`itsdata`) or a raw itsdata row from `reference="itsData"`. */
export function ITSInput(props: AutocompleteInputProps) {
  const { selectedChoices } = useChoicesContext();
  const { setValue, getValues } = useFormContext();
  const selectedChoice = selectedChoices?.[0] as Record<string, unknown> | undefined;

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("name", itsField(selectedChoice, "Full_Name") ?? selectedChoice.name ?? null);
      setValue("mobileNo", itsField(selectedChoice, "Mobile"));

      const itsAddress = normalizeString(itsField(selectedChoice, "Address"));
      if (itsAddress) {
        const thalis = getValues("thalis") as unknown[] | undefined;
        if (Array.isArray(thalis)) {
          thalis.forEach((thali, idx) => {
            const row = thali as { deliveryAddress?: string };
            const current = normalizeString(row?.deliveryAddress);
            if (!current) {
              setValue(`thalis.${idx}.deliveryAddress`, itsAddress, { shouldDirty: true });
            }
          });
        }
      }
    } else {
      setValue("name", null);
      setValue("mobileNo", null);
    }
  }, [selectedChoice, setValue, getValues]);

  return <AutocompleteInput {...props} size="small" />;
}
