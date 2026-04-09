import React, { useEffect, useMemo, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { TextInput, BooleanInput, minValue, useGetList, useGetOne } from "react-admin";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import { formatINR } from "@/utils";
import type { FmbReceiptFormValues } from "../fmbReceiptFormTypes";
import { LINE_KIND, type LineKind } from "./lineKind";
import { AllocationTotalsSummary } from "./AllocationTotalsSummary";
import { ReceiptAllocationValidator } from "./ReceiptAllocationValidator";
import {
  annualRowLabel,
  applyMaxSuggestedAmounts,
  buildPendingAllocationsFromLists,
  cloneAllocationTemplate,
  computeRemainingForRow,
  contributionRowLabel,
  getPreferredAllocationFromTemplate,
  pickAnnualPendingAmount,
  pickContributionPendingAmount,
  prioritizePreferredAllocation,
  seedStandaloneTemplateRows,
} from "./helpers";
import type { AllocationFormRow, FmbContributionListRecord, FmbTakhmeenListRecord } from "./types";

export type PaymentTotalAndAllocationsSectionProps = {
  allocationTemplate: AllocationFormRow[];
};

type AllocationDisplayRow = {
  index: number;
  kind: LineKind;
  pending: number | null;
  label: string;
  payNow: number;
};

export function PaymentTotalAndAllocationsSection({
  allocationTemplate,
}: PaymentTotalAndAllocationsSectionProps) {
  const { setValue, getValues, clearErrors, watch } = useFormContext<FmbReceiptFormValues>();
  const amountRaw = watch("amount");
  const creditUsedRaw = watch("creditUsed");
  const amountConfirmed = watch("amountConfirmed") === true;
  const fmbIdWatch = watch("fmbId");
  const allocationsWatch = watch("allocations");
  const amountNum = Number(amountRaw) || 0;
  const creditUsedNum = Number(creditUsedRaw) || 0;
  const effectiveTotal = Math.max(0, amountNum) + Math.max(0, creditUsedNum);
  const canConfirm = effectiveTotal >= 1;
  const preferred = useMemo(
    () => getPreferredAllocationFromTemplate(allocationTemplate),
    [allocationTemplate]
  );

  const { data: fmbDataForCredit } = useGetOne(
    "fmbData",
    { id: fmbIdWatch },
    { enabled: Boolean(fmbIdWatch?.trim()) }
  );
  const availableCredit = fmbDataForCredit?.paymentCreditBalance ?? 0;
  const showCredit = Boolean(fmbIdWatch?.trim()) && availableCredit > 0;

  const allocationSeedTokenRef = useRef(0);
  const lastSeededTokenRef = useRef(-1);

  const listEnabled = amountConfirmed === true && Boolean(fmbIdWatch?.trim());
  const {
    data: takhmeenData = [],
    isLoading: takhmeenLoading,
    isPending: takhmeenPending,
  } = useGetList(
    "fmbTakhmeen",
    {
      filter: { fmbId: fmbIdWatch },
      pagination: { page: 1, perPage: 500 },
      sort: { field: "startDate", order: "DESC" },
    },
    { enabled: listEnabled }
  );
  const {
    data: contributionsData = [],
    isLoading: contributionsLoading,
    isPending: contributionsPending,
  } = useGetList(
    "fmbContributions",
    {
      filter: { fmbId: fmbIdWatch },
      pagination: { page: 1, perPage: 500 },
    },
    { enabled: listEnabled }
  );

  const takhmeenList = takhmeenData as FmbTakhmeenListRecord[];
  const contributionsList = contributionsData as FmbContributionListRecord[];

  const displayRows = useMemo((): AllocationDisplayRow[] => {
    const rows: AllocationFormRow[] = Array.isArray(allocationsWatch) ? allocationsWatch : [];
    return rows
      .map((row, index) => {
        const kind: LineKind =
          row.lineKind === LINE_KIND.CONTRIBUTION ? LINE_KIND.CONTRIBUTION : LINE_KIND.ANNUAL;
        const payNow = Number(row.amount) || 0;
        const pending =
          kind === LINE_KIND.CONTRIBUTION
            ? pickContributionPendingAmount(
                contributionsList.find((c) => String(c.id) === String(row.fmbContributionId))
              )
            : pickAnnualPendingAmount(
                takhmeenList.find((t) => String(t.id) === String(row.fmbTakhmeenId))
              );
        const label =
          kind === LINE_KIND.CONTRIBUTION
            ? contributionRowLabel(
                contributionsList.find((c) => String(c.id) === String(row.fmbContributionId)) ?? {}
              )
            : annualRowLabel(
                takhmeenList.find((t) => String(t.id) === String(row.fmbTakhmeenId)) ?? {}
              );
        return { index, kind, pending, label, payNow };
      })
      .filter(({ pending, payNow }) => payNow > 0 || (pending != null && Number(pending) > 0));
  }, [allocationsWatch, takhmeenList, contributionsList]);

  useEffect(() => {
    if (!amountConfirmed) {
      return;
    }
    const token = allocationSeedTokenRef.current;
    if (lastSeededTokenRef.current === token) {
      return;
    }

    const totalPay = Number(amountRaw) || 0;
    const credit = Number(creditUsedRaw) || 0;
    const effectivePay = totalPay + credit;

    if (!fmbIdWatch?.trim()) {
      const template = cloneAllocationTemplate(allocationTemplate);
      setValue("allocations", seedStandaloneTemplateRows(template, effectivePay), {
        shouldDirty: true,
        shouldValidate: true,
      });
      lastSeededTokenRef.current = token;
      return;
    }

    if (takhmeenLoading || contributionsLoading || takhmeenPending || contributionsPending) {
      return;
    }

    const pending = buildPendingAllocationsFromLists(takhmeenList, contributionsList);
    const prioritized = prioritizePreferredAllocation(
      pending.rows,
      pending.meta,
      preferred,
      takhmeenList,
      contributionsList
    );
    const seeded =
      prioritized.rows.length > 0
        ? applyMaxSuggestedAmounts(prioritized.rows, prioritized.meta, effectivePay)
        : [];
    setValue("allocations", seeded, {
      shouldDirty: true,
      shouldValidate: true,
    });
    lastSeededTokenRef.current = token;
  }, [
    amountConfirmed,
    amountRaw,
    creditUsedRaw,
    allocationTemplate,
    fmbIdWatch,
    takhmeenLoading,
    contributionsLoading,
    takhmeenPending,
    contributionsPending,
    takhmeenList,
    contributionsList,
    preferred,
    setValue,
  ]);

  useEffect(() => {
    // Prevent hidden creditUsed from affecting totals/validation when credit UI isn't shown.
    if (!showCredit && (Number(getValues("creditUsed")) || 0) > 0) {
      setValue("creditUsed", 0, { shouldDirty: true, shouldValidate: true });
    }
  }, [showCredit, getValues, setValue]);

  const handleConfirmTotal = () => {
    if (!canConfirm) {
      return;
    }
    allocationSeedTokenRef.current += 1;
    lastSeededTokenRef.current = -1;
    clearErrors("allocations");
    clearErrors("fmbId");
    setValue("amountConfirmed", true, { shouldDirty: true, shouldValidate: true });
  };

  const handleEditTotal = () => {
    lastSeededTokenRef.current = -1;
    setValue("amountConfirmed", false, { shouldDirty: true, shouldValidate: true });
    setValue("allocations", [], { shouldDirty: true, shouldValidate: true });
    clearErrors("allocations");
    clearErrors("fmbId");
  };

  const listsLoading =
    listEnabled &&
    (takhmeenLoading || contributionsLoading || takhmeenPending || contributionsPending);
  const rowCount = Array.isArray(allocationsWatch) ? allocationsWatch.length : 0;

  const handleApplyRemainingToRow = (rowIndex: number, pending: number | null) => {
    const cash = Number(getValues("amount")) || 0;
    const credit = Number(getValues("creditUsed")) || 0;
    const totalPay = cash + credit;
    const allocs = getValues("allocations");
    const remaining = computeRemainingForRow(allocs, rowIndex, totalPay);
    const cap = pending != null && Number.isFinite(pending) ? Math.max(0, pending) : remaining;
    const applied = Math.min(remaining, cap);
    setValue(`allocations.${rowIndex}.amount`, applied > 0 ? applied : "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleClearRowAmount = (rowIndex: number) => {
    setValue(`allocations.${rowIndex}.amount`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <BooleanInput source="amountConfirmed" label={false} sx={{ display: "none" }} />
      <ReceiptAllocationValidator enabled={amountConfirmed} />
      <Grid container spacing={2} sx={{ alignItems: "flex-end", mb: 1 }}>
        <Grid size={{ xs: 12, sm: showCredit ? 4 : 8 }}>
          <NoArrowKeyNumberInput
            source="amount"
            label="Amount received (₹)"
            fullWidth
            InputProps={{ readOnly: amountConfirmed }}
            sx={
              amountConfirmed
                ? {
                    "& .MuiInputBase-input": { pointerEvents: "none" },
                    opacity: 0.75,
                  }
                : undefined
            }
            validate={[minValue(0)]}
          />
        </Grid>
        {showCredit ? (
          <Grid size={{ xs: 12, sm: 4 }}>
            <NoArrowKeyNumberInput
              source="creditUsed"
              label="Use on-account credit (₹)"
              fullWidth
              InputProps={{ readOnly: amountConfirmed }}
              sx={
                amountConfirmed
                  ? {
                      "& .MuiInputBase-input": { pointerEvents: "none" },
                      opacity: 0.75,
                    }
                  : undefined
              }
              validate={[minValue(0)]}
            />
          </Grid>
        ) : null}
        <Grid size={{ xs: 12, sm: 4 }}>
          {amountConfirmed ? (
            <Button type="button" variant="outlined" fullWidth onClick={handleEditTotal}>
              Edit total
            </Button>
          ) : (
            <Button
              type="button"
              variant="contained"
              fullWidth
              disabled={!canConfirm}
              onClick={handleConfirmTotal}
            >
              Confirm total
            </Button>
          )}
        </Grid>
        {showCredit ? (
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: { xs: "left", sm: "right" },
              }}
            >
              Effective total: {formatINR(effectiveTotal)}
            </Typography>
          </Grid>
        ) : null}
      </Grid>
      {!amountConfirmed ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter and confirm the payment total, then split it across annual and contribution lines.
        </Typography>
      ) : null}
      {amountConfirmed ? (
        <>
          <AllocationTotalsSummary />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Apply payment to pending items
          </Typography>
          {listsLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading pending annual and contribution balances…
              </Typography>
            </Box>
          ) : null}
          {!listsLoading && rowCount === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }} variant="outlined">
              No pending annual or contribution balances for this FMB. You can still save if the
              full payment is unallocated on-account (requires FMB selected).
            </Alert>
          ) : null}
          {!listsLoading && rowCount > 0 ? (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ mb: 2, maxHeight: 420, width: "100%", overflowX: "auto" }}
            >
              <Table size="small" stickyHeader sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Pending (₹)</TableCell>
                    <TableCell align="right" sx={{ minWidth: 140 }}>
                      Pay now (₹)
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 150 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayRows.map(({ index, kind, pending, label }) => (
                    <TableRow key={`alloc-${index}`}>
                      <TableCell sx={{ verticalAlign: "top" }}>
                        {kind === LINE_KIND.CONTRIBUTION ? "Contribution" : "Annual"}
                      </TableCell>
                      <TableCell sx={{ verticalAlign: "top" }}>
                        <Typography variant="body2">{label}</Typography>
                        <TextInput
                          source={`allocations.${index}.lineKind`}
                          sx={{ display: "none" }}
                          label={false}
                        />
                        <TextInput
                          source={`allocations.${index}.fmbTakhmeenId`}
                          sx={{ display: "none" }}
                          label={false}
                        />
                        <TextInput
                          source={`allocations.${index}.fmbContributionId`}
                          sx={{ display: "none" }}
                          label={false}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ verticalAlign: "top" }}>
                        {pending != null && Number.isFinite(pending) ? pending : "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ verticalAlign: "top" }}>
                        <NoArrowKeyNumberInput
                          source={`allocations.${index}.amount`}
                          label={false}
                          fullWidth
                          validate={[minValue(0)]}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ verticalAlign: "top" }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="center"
                          flexWrap="wrap"
                        >
                          <Button
                            type="button"
                            size="small"
                            variant="text"
                            onClick={() => handleApplyRemainingToRow(index, pending)}
                          >
                            Apply
                          </Button>
                          <Button
                            type="button"
                            size="small"
                            variant="text"
                            color="warning"
                            onClick={() => handleClearRowAmount(index)}
                          >
                            Clear
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </>
      ) : null}
    </>
  );
}
