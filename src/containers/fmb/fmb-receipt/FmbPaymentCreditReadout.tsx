import React from "react";
import { useWatch } from "react-hook-form";
import { useGetOne } from "react-admin";
import Alert from "@mui/material/Alert";
import { formatINR } from "@/utils";
import type { FmbReceiptFormValues } from "./fmbReceiptFormTypes";

export function FmbPaymentCreditReadout() {
  const fmbId = useWatch<FmbReceiptFormValues>({ name: "fmbId" }) as string | undefined;
  const { data, isLoading } = useGetOne(
    "fmbData",
    { id: fmbId },
    { enabled: Boolean(typeof fmbId === "string" && fmbId.trim()) }
  );
  if (typeof fmbId !== "string" || !fmbId.trim() || isLoading || !data) {
    return null;
  }
  const bal = data.paymentCreditBalance ?? 0;
  return (
    <Alert severity="info" sx={{ mb: 1 }} variant="outlined">
      Current FMB on-account credit balance: {formatINR(bal)}
    </Alert>
  );
}
