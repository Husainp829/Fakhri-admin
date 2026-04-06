/* eslint-disable no-console */
import { useEffect, type ComponentProps } from "react";
import { AutocompleteInput, useChoicesContext } from "react-admin";
import { useFormContext } from "react-hook-form";

type ItsInputProps = ComponentProps<typeof AutocompleteInput>;

export const ITSInput = (props: ItsInputProps) => {
  const { selectedChoices = [] } = useChoicesContext();
  const { setValue } = useFormContext();
  const selectedChoice = selectedChoices[0] as
    | (Record<string, unknown> & {
        id?: string;
        sabilNo?: string;
        name?: string;
        sabilTakhmeenCurrent?: { takhmeenAmount?: number };
        lastPaidDate?: string;
        sabilType?: string;
        pendingBalance?: unknown;
      })
    | undefined;

  useEffect(() => {
    if (selectedChoice?.id) {
      setValue("sabilNo", selectedChoice.sabilNo);
      setValue("name", selectedChoice.name);
      setValue("takhmeenAmount", selectedChoice?.sabilTakhmeenCurrent?.takhmeenAmount);
      setValue("lastPaidDate", selectedChoice.lastPaidDate);
      setValue("sabilType", selectedChoice.sabilType);
      setValue("balancePending", selectedChoice?.pendingBalance);
    }
  }, [selectedChoice, setValue]);

  return <AutocompleteInput {...props} size="small" />;
};
