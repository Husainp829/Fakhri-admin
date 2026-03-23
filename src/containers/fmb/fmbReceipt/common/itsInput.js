/* eslint-disable no-console */
import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext } from "react-admin";
import { useFormContext } from "react-hook-form";

export const ITSInput = (props) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selectedChoice = selectedChoices[0];

  useEffect(() => {
    const its = selectedChoice?.itsdata;
    if (selectedChoice?.id) {
      setValue("fmbNo", selectedChoice.fmbNo);
      setValue("name", its?.Full_Name ?? selectedChoice.name);
      setValue("area", its?.Area ?? null);
      setValue("masool", its?.Sector_Incharge_Name ?? null);
      setValue("takhmeenAmount", selectedChoice?.fmbTakhmeenCurrent?.takhmeenAmount);
      setValue("lastPaidDate", selectedChoice.lastPaidDate);
      setValue("balancePending", selectedChoice?.fmbTakhmeenCurrent?.pendingBalance);
      setValue("fmbTakhmeenId", selectedChoice?.fmbTakhmeenCurrent?.id ?? null);
    } else {
      setValue("fmbTakhmeenId", null);
      setValue("area", null);
      setValue("masool", null);
    }
  }, [selectedChoice, setValue]);

  return <AutocompleteInput {...props} size="small" />;
};
