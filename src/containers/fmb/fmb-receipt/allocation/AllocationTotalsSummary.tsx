import React from "react";
import { useWatch } from "react-hook-form";
import Typography from "@mui/material/Typography";
import { formatINR } from "@/utils";
import type { FmbReceiptFormValues } from "../fmbReceiptFormTypes";
import type { AllocationFormRow } from "./types";

export function AllocationTotalsSummary() {
  const amount = useWatch<FmbReceiptFormValues>({ name: "amount" });
  const creditUsed = useWatch<FmbReceiptFormValues>({ name: "creditUsed" });
  const allocationsRaw = useWatch<FmbReceiptFormValues>({ name: "allocations" });
  const fmbId = useWatch<FmbReceiptFormValues>({ name: "fmbId" }) as string | undefined;
  const total = (Number(amount) || 0) + (Number(creditUsed) || 0);
  const rows: AllocationFormRow[] = Array.isArray(allocationsRaw) ? allocationsRaw : [];
  const allocated = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const remainder = total - allocated;

  if (!total) {
    return null;
  }

  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
      Allocated: {formatINR(allocated)} of {formatINR(total)}
      {remainder > 0 ? (
        <>
          {" "}
          · Unallocated: {formatINR(remainder)}
          {!fmbId?.trim()
            ? " (select FMB to record as credit)"
            : " (will add to FMB payment credit)"}
        </>
      ) : null}
      {remainder < 0 ? " · Reduce line amounts — allocated exceeds total." : null}
    </Typography>
  );
}
