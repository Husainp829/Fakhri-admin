import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { FmbReceiptFormValues } from "../fmbReceiptFormTypes";
import type { AllocationFormRow } from "./types";

export type ReceiptAllocationValidatorProps = {
  enabled: boolean;
};

export function ReceiptAllocationValidator({ enabled }: ReceiptAllocationValidatorProps) {
  const { setError, clearErrors, watch } = useFormContext<FmbReceiptFormValues>();
  const amount = watch("amount");
  const creditUsed = watch("creditUsed");
  const allocations = watch("allocations");
  const fmbId = watch("fmbId") as string | undefined;

  useEffect(() => {
    if (!enabled) {
      clearErrors("allocations");
      clearErrors("fmbId");
      clearErrors("creditUsed");
      return;
    }
    const cash = Number(amount) || 0;
    const credit = Number(creditUsed) || 0;
    const total = cash + credit;
    const rows: AllocationFormRow[] = Array.isArray(allocations) ? allocations : [];
    const sum = rows.reduce((s, row) => s + (Number(row.amount) || 0), 0);
    if (sum > total) {
      setError("allocations", {
        type: "manual",
        message: "Sum of allocation lines cannot exceed payment amount.",
      });
      return;
    }
    if (credit > 0 && !fmbId?.trim()) {
      setError("fmbId", {
        type: "manual",
        message: "Select an FMB account when using on-account credit.",
      });
      return;
    }
    if (total > 0 && total - sum > 0 && !fmbId?.trim()) {
      setError("fmbId", {
        type: "manual",
        message:
          "Select an FMB account when part of the payment is unallocated (on-account credit).",
      });
      return;
    }
    clearErrors("allocations");
    clearErrors("fmbId");
    clearErrors("creditUsed");
  }, [enabled, amount, creditUsed, allocations, fmbId, setError, clearErrors]);

  return null;
}
