/* eslint-disable no-console */
import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext } from "react-admin";
import { useFormContext } from "react-hook-form";

export const ITSInput = (props) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selectedChoice = selectedChoices[0];

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("fmbNo", selectedChoice.fmbNo);
      setValue("name", selectedChoice.name);
      setValue("takhmeenAmount", selectedChoice?.fmbTakhmeen?.takhmeenAmount);
      setValue("lastPaidDate", selectedChoice.lastPaidDate);
      setValue("previousTakhmeenAmount", selectedChoice?.fmbTakhmeenCurrent?.takhmeenAmount);
    }
  }, [selectedChoice]);

  return <AutocompleteInput {...props} size="small" />;
};
