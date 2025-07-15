/* eslint-disable no-console */
import React, { useEffect } from "react";
import { SelectInput, useChoicesContext } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

export const PurposeInput = (props) => {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const sarkariLagat = useWatch({ name: "sarkariLagat" });
  const selectedChoice = selectedChoices[0];
  useEffect(() => {
    if (selectedChoice?.id && sarkariLagat !== selectedChoice.sarkariLagat) {
      setValue("sarkariLagat", selectedChoice.sarkariLagat);
    }
  }, [selectedChoice]);

  return <SelectInput {...props} size="small" />;
};
