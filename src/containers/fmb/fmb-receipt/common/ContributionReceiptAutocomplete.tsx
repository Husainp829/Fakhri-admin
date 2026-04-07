import React, { useEffect } from "react";
import { AutocompleteInput, useChoicesContext, type AutocompleteInputProps } from "react-admin";
import { useFormContext } from "react-hook-form";
import { formatINR } from "@/utils";

/** Hydrates read-only contribution total fields when a contribution is selected on the receipt form. */

export function ContributionReceiptAutocomplete(props: AutocompleteInputProps) {
  const { selectedChoices } = useChoicesContext();
  const { setValue } = useFormContext();
  const selected = selectedChoices?.[0];

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

export function contributionReceiptOptionText(choice: {
  contributionType?: string;
  beneficiaryItsNo?: string;
  beneficiaryName?: string | null;
  amount?: number;
  receiptsPaidTotal?: number;
  contributionPendingAmount?: number | null;
}) {
  const paid = choice.receiptsPaidTotal ?? 0;
  const pending =
    choice.contributionPendingAmount != null
      ? choice.contributionPendingAmount
      : Math.max(0, (choice.amount ?? 0) - paid);
  const bn = choice.beneficiaryName?.trim();
  const who = bn ? `${choice.beneficiaryItsNo} (${bn})` : String(choice.beneficiaryItsNo ?? "—");
  return `${choice.contributionType} · Beneficiary ${who} · ${formatINR(choice.amount, { empty: "—" })} (paid ${formatINR(paid)}, due ${formatINR(pending)})`;
}
