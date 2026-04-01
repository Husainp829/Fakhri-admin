import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext } from "react-admin";
import { useFormContext } from "react-hook-form";
import { formatINR } from "../../../../utils";

/** Hydrates read-only contribution total fields when a contribution is selected on the receipt form. */
export function ContributionReceiptAutocomplete(props) {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selected = selectedChoices[0];

  useEffect(() => {
    if (selected?.id) {
      const paid = selected.receiptsPaidTotal ?? 0;
      const pending =
        selected.contributionPendingAmount != null
          ? selected.contributionPendingAmount
          : Math.max(0, (selected.amount ?? 0) - paid);
      setValue("contribDisplayAmount", selected.amount ?? null);
      setValue("contribDisplayPaid", paid);
      setValue("contribDisplayPending", pending);
    } else {
      setValue("contribDisplayAmount", null);
      setValue("contribDisplayPaid", null);
      setValue("contribDisplayPending", null);
    }
  }, [selected, setValue]);

  return <AutocompleteInput {...props} />;
}

export function contributionReceiptOptionText(choice) {
  const paid = choice.receiptsPaidTotal ?? 0;
  const pending =
    choice.contributionPendingAmount != null
      ? choice.contributionPendingAmount
      : Math.max(0, (choice.amount ?? 0) - paid);
  return `${choice.contributionType} · Beneficiary ${choice.beneficiaryItsNo} · ${formatINR(choice.amount, { empty: "—" })} (paid ${formatINR(paid)}, due ${formatINR(pending)})`;
}
