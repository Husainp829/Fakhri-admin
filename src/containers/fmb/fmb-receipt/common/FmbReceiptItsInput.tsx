import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext, type AutocompleteInputProps } from "react-admin";
import { useFormContext } from "react-hook-form";

type ITSInputProps = AutocompleteInputProps & { syncAnnualContext?: boolean };

/** When false (e.g. contribution receipt), only syncs FMB identity fields — not annual takhmeen amounts or fmbTakhmeenId. */
export const ITSInput = (props: ITSInputProps) => {
  const { syncAnnualContext = true, ...autocompleteProps } = props;
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selectedChoice = selectedChoices?.[0];

  useEffect(() => {
    const its = selectedChoice?.itsdata;
    if (selectedChoice?.id) {
      setValue("name", its?.Full_Name ?? selectedChoice.name);
      setValue("area", its?.Area ?? null);
      setValue("masool", its?.Sector_Incharge_Name ?? null);
      if (syncAnnualContext) {
        setValue("takhmeenAmount", selectedChoice?.fmbTakhmeenCurrent?.takhmeenAmount);
        setValue("lastPaidDate", selectedChoice.lastPaidDate);
        setValue("balancePending", selectedChoice?.fmbTakhmeenCurrent?.pendingBalance);
        setValue("fmbTakhmeenId", selectedChoice?.fmbTakhmeenCurrent?.id ?? null);
      } else {
        setValue("takhmeenAmount", null);
        setValue("lastPaidDate", null);
        setValue("balancePending", null);
        setValue("fmbTakhmeenId", null);
      }
    } else {
      setValue("fmbTakhmeenId", null);
      setValue("area", null);
      setValue("masool", null);
      if (!syncAnnualContext) {
        setValue("takhmeenAmount", null);
        setValue("lastPaidDate", null);
        setValue("balancePending", null);
      }
    }
  }, [selectedChoice, setValue, syncAnnualContext]);

  return <AutocompleteInput {...autocompleteProps} size={autocompleteProps.size ?? "small"} />;
};
