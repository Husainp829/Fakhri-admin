import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext, type AutocompleteInputProps } from "react-admin";
import { useFormContext } from "react-hook-form";

/**
 * Autocomplete for selecting an FMB record (`fmbId`); fills display-only fields from the choice.
 */
export const ITSInput = (props: AutocompleteInputProps) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selectedChoice = selectedChoices?.[0];

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("name", selectedChoice.name);
      setValue("previousTakhmeenAmount", selectedChoice?.fmbTakhmeenCurrent?.takhmeenAmount ?? "");
    }
  }, [selectedChoice, setValue]);

  return <AutocompleteInput {...props} size="small" />;
};
