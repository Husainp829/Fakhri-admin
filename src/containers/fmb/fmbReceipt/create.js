import React, { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useFormContext, useWatch } from "react-hook-form";
import {
  TextInput,
  Create,
  SimpleForm,
  ReferenceInput,
  DateInput,
  RadioButtonGroupInput,
  BooleanInput,
  required,
  minValue,
  useGetList,
  useGetOne,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
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
import { ITSInput } from "./common/itsInput";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";
import { formatINR } from "../../../utils";

const LINE_KIND = {
  ANNUAL: "ANNUAL",
  CONTRIBUTION: "CONTRIBUTION",
};

function ReceiptAllocationValidator({ enabled }) {
  const { setError, clearErrors, watch } = useFormContext();
  const amount = watch("amount");
  const creditUsed = watch("creditUsed");
  const allocations = watch("allocations");
  const fmbId = watch("fmbId");

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
    const rows = Array.isArray(allocations) ? allocations : [];
    const sum = rows.reduce((s, row) => s + (Number(row?.amount) || 0), 0);
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

function AllocationTotalsSummary() {
  const amount = useWatch({ name: "amount" });
  const creditUsed = useWatch({ name: "creditUsed" });
  const allocations = useWatch({ name: "allocations" });
  const fmbId = useWatch({ name: "fmbId" });
  const total = (Number(amount) || 0) + (Number(creditUsed) || 0);
  const rows = Array.isArray(allocations) ? allocations : [];
  const allocated = rows.reduce((s, r) => s + (Number(r?.amount) || 0), 0);
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

function FmbPaymentCreditReadout() {
  const fmbId = useWatch({ name: "fmbId" });
  const { data, isLoading } = useGetOne(
    "fmbData",
    { id: fmbId },
    { enabled: Boolean(fmbId?.trim()) },
  );
  if (!fmbId?.trim() || isLoading || !data) {
    return null;
  }
  const bal = data.paymentCreditBalance ?? 0;
  return (
    <Alert severity="info" sx={{ mb: 1 }} variant="outlined">
      Current FMB on-account credit balance: {formatINR(bal)}
    </Alert>
  );
}

function pickAnnualPendingAmount(choice) {
  if (!choice) {
    return null;
  }
  if (choice.takhmeenPendingAmount != null) {
    return Number(choice.takhmeenPendingAmount) || 0;
  }
  if (choice.balancePending != null) {
    return Number(choice.balancePending) || 0;
  }
  if (choice.pendingBalance != null) {
    return Number(choice.pendingBalance) || 0;
  }
  if (choice.pendingAmount != null) {
    return Number(choice.pendingAmount) || 0;
  }
  if (choice.takhmeenAmount != null) {
    return Number(choice.takhmeenAmount) || 0;
  }
  return null;
}

function pickContributionPendingAmount(choice) {
  if (!choice) {
    return null;
  }
  if (choice.contributionPendingAmount != null) {
    return Number(choice.contributionPendingAmount) || 0;
  }
  const total = Number(choice.amount);
  const paid = Number(choice.receiptsPaidTotal) || 0;
  if (Number.isFinite(total)) {
    return Math.max(0, total - paid);
  }
  return null;
}

function annualRowLabel(t) {
  const a = t?.hijriYearStart ?? "—";
  const b = t?.hijriYearEnd ?? "—";
  return `${a}–${b} · commit ${formatINR(t?.takhmeenAmount, { empty: "—" })}`;
}

function contributionRowLabel(c) {
  const paid = c?.receiptsPaidTotal ?? 0;
  const pending =
    c?.contributionPendingAmount != null
      ? c.contributionPendingAmount
      : Math.max(0, (c?.amount ?? 0) - paid);
  return `${c?.contributionType ?? "—"} · ITS ${c?.beneficiaryItsNo ?? "—"} · due ${formatINR(pending)}`;
}

/** @returns {{ rows: object[], meta: { kind: string, record: object }[] }} */
function buildPendingAllocationsFromLists(takhmeenList, contributionsList) {
  const rows = [];
  const meta = [];
  (takhmeenList || []).forEach((t) => {
    const pending = pickAnnualPendingAmount(t);
    if (pending != null && pending > 0) {
      meta.push({ kind: LINE_KIND.ANNUAL, record: t });
      rows.push({
        lineKind: LINE_KIND.ANNUAL,
        fmbTakhmeenId: t.id,
        fmbContributionId: null,
        amount: "",
      });
    }
  });
  (contributionsList || []).forEach((c) => {
    const pending = pickContributionPendingAmount(c);
    if (pending != null && pending > 0) {
      meta.push({ kind: LINE_KIND.CONTRIBUTION, record: c });
      rows.push({
        lineKind: LINE_KIND.CONTRIBUTION,
        fmbContributionId: c.id,
        fmbTakhmeenId: null,
        amount: "",
      });
    }
  });
  return { rows, meta };
}

function applyMaxSuggestedAmounts(rows, meta, totalPayment) {
  let remaining = Math.max(0, Number(totalPayment) || 0);
  return rows.map((row, i) => {
    const m = meta[i];
    const pendingCap =
      m?.kind === LINE_KIND.CONTRIBUTION
        ? pickContributionPendingAmount(m.record)
        : pickAnnualPendingAmount(m.record);
    const cap =
      pendingCap != null && Number.isFinite(pendingCap) ? Math.max(0, pendingCap) : remaining;
    const suggested = Math.min(remaining, cap);
    remaining -= suggested;
    return {
      ...row,
      amount: suggested > 0 ? suggested : "",
    };
  });
}

/** Standalone receipt (no FMB): put the full payment on the first template row. */
function seedStandaloneTemplateRows(rows, totalPayment) {
  const t = Math.max(0, Number(totalPayment) || 0);
  if (!rows.length) {
    return [];
  }
  return rows.map((row, i) =>
    i === 0 ? { ...row, amount: t > 0 ? t : "" } : { ...row, amount: "" },
  );
}

function cloneAllocationTemplate(rows) {
  return rows.map((r) => ({
    ...r,
    amount: r.amount === undefined || r.amount === null ? "" : r.amount,
  }));
}

function getPreferredAllocationFromTemplate(allocationTemplate) {
  const first = Array.isArray(allocationTemplate) ? allocationTemplate[0] : null;
  const kind =
    first?.lineKind === LINE_KIND.CONTRIBUTION ? LINE_KIND.CONTRIBUTION : LINE_KIND.ANNUAL;
  const contributionId = first?.fmbContributionId?.trim?.() || "";
  const takhmeenId = first?.fmbTakhmeenId?.trim?.() || "";

  if (kind === LINE_KIND.CONTRIBUTION && contributionId) {
    return { kind, id: contributionId };
  }
  if (kind === LINE_KIND.ANNUAL && takhmeenId) {
    return { kind, id: takhmeenId };
  }
  return null;
}

function prioritizePreferredAllocation(rows, meta, preferred, takhmeenList, contributionsList) {
  if (!preferred) {
    return { rows, meta };
  }

  const matchIndex = meta.findIndex((m) => {
    if (preferred.kind === LINE_KIND.CONTRIBUTION) {
      return m?.kind === LINE_KIND.CONTRIBUTION && m?.record?.id === preferred.id;
    }
    return m?.kind === LINE_KIND.ANNUAL && m?.record?.id === preferred.id;
  });

  if (matchIndex >= 0) {
    const newRows = [...rows];
    const newMeta = [...meta];
    const [r] = newRows.splice(matchIndex, 1);
    const [m] = newMeta.splice(matchIndex, 1);
    return { rows: [r, ...newRows], meta: [m, ...newMeta] };
  }

  // Preferred target isn't pending (or not in list) — still put it first so "Apply" / manual entry hits it first.
  if (preferred.kind === LINE_KIND.CONTRIBUTION) {
    const rec = (contributionsList || []).find((c) => c?.id === preferred.id) || {
      id: preferred.id,
    };
    return {
      rows: [
        {
          lineKind: LINE_KIND.CONTRIBUTION,
          fmbContributionId: preferred.id,
          fmbTakhmeenId: null,
          amount: "",
        },
        ...rows,
      ],
      meta: [{ kind: LINE_KIND.CONTRIBUTION, record: rec }, ...meta],
    };
  }

  const rec = (takhmeenList || []).find((t) => t?.id === preferred.id) || { id: preferred.id };
  return {
    rows: [
      {
        lineKind: LINE_KIND.ANNUAL,
        fmbTakhmeenId: preferred.id,
        fmbContributionId: null,
        amount: "",
      },
      ...rows,
    ],
    meta: [{ kind: LINE_KIND.ANNUAL, record: rec }, ...meta],
  };
}

function computeRemainingForRow(allocations, rowIndex, totalPayment) {
  const total = Math.max(0, Number(totalPayment) || 0);
  const rows = Array.isArray(allocations) ? allocations : [];
  const otherSum = rows.reduce((s, r, i) => (i === rowIndex ? s : s + (Number(r?.amount) || 0)), 0);
  return Math.max(0, total - otherSum);
}

function PaymentTotalAndAllocationsSection({ allocationTemplate }) {
  const { setValue, getValues, clearErrors, watch } = useFormContext();
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
    [allocationTemplate],
  );

  const { data: fmbDataForCredit } = useGetOne(
    "fmbData",
    { id: fmbIdWatch },
    { enabled: Boolean(fmbIdWatch?.trim()) },
  );
  const availableCredit = fmbDataForCredit?.paymentCreditBalance ?? 0;
  const showCredit = Boolean(fmbIdWatch?.trim()) && availableCredit > 0;

  const allocationSeedTokenRef = useRef(0);
  const lastSeededTokenRef = useRef(-1);

  const listEnabled = amountConfirmed === true && Boolean(fmbIdWatch?.trim());
  const {
    data: takhmeenList = [],
    isLoading: takhmeenLoading,
    isPending: takhmeenPending,
  } = useGetList(
    "fmbTakhmeen",
    {
      filter: { fmbId: fmbIdWatch },
      pagination: { page: 1, perPage: 500 },
      sort: { field: "startDate", order: "DESC" },
    },
    { enabled: listEnabled },
  );
  const {
    data: contributionsList = [],
    isLoading: contributionsLoading,
    isPending: contributionsPending,
  } = useGetList(
    "fmbContributions",
    {
      filter: { fmbId: fmbIdWatch },
      pagination: { page: 1, perPage: 500 },
    },
    { enabled: listEnabled },
  );

  const displayRows = useMemo(() => {
    const rows = Array.isArray(allocationsWatch) ? allocationsWatch : [];
    return rows
      .map((row, index) => {
        const kind =
          row?.lineKind === LINE_KIND.CONTRIBUTION ? LINE_KIND.CONTRIBUTION : LINE_KIND.ANNUAL;
        const payNow = Number(row?.amount) || 0;
        const pending =
          kind === LINE_KIND.CONTRIBUTION
            ? pickContributionPendingAmount(
                contributionsList.find((c) => c.id === row?.fmbContributionId),
              )
            : pickAnnualPendingAmount(takhmeenList.find((t) => t.id === row?.fmbTakhmeenId));
        const label =
          kind === LINE_KIND.CONTRIBUTION
            ? contributionRowLabel(
                contributionsList.find((c) => c.id === row?.fmbContributionId) || {},
              )
            : annualRowLabel(takhmeenList.find((t) => t.id === row?.fmbTakhmeenId) || {});
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
      contributionsList,
    );
    const seeded =
      prioritized.rows.length > 0
        ? applyMaxSuggestedAmounts(prioritized.rows, prioritized.meta, effectivePay)
        : [];
    setValue("allocations", seeded, { shouldDirty: true, shouldValidate: true });
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

  const handleApplyRemainingToRow = (rowIndex, pending) => {
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

  const handleClearRowAmount = (rowIndex) => {
    setValue(`allocations.${rowIndex}.amount`, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <BooleanInput source="amountConfirmed" label={false} sx={{ display: "none" }} />
      <ReceiptAllocationValidator enabled={amountConfirmed} />

      <Grid container spacing={2} sx={{ alignItems: "center", mb: 1 }}>
        <Grid item xs={12} sm={showCredit ? 4 : 8}>
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
          <Grid item xs={12} sm={4}>
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
        <Grid item xs={12} sm={4}>
          {amountConfirmed ? (
            <Button
              type="button"
              variant="outlined"
              fullWidth
              sx={{ mt: 0.5 }}
              onClick={handleEditTotal}
            >
              Edit total
            </Button>
          ) : (
            <Button
              type="button"
              variant="contained"
              fullWidth
              sx={{ mt: 0.5 }}
              disabled={!canConfirm}
              onClick={handleConfirmTotal}
            >
              Confirm total
            </Button>
          )}
        </Grid>
      </Grid>

      {!amountConfirmed ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter and confirm the payment total, then split it across annual and contribution lines.
        </Typography>
      ) : null}

      {showCredit ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, textAlign: { xs: "left", sm: "right" } }}
        >
          Effective total: {formatINR(effectiveTotal)}
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
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, maxHeight: 420 }}>
              <Table size="small" stickyHeader>
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

export default function FmbReceiptCreate(props) {
  const [searchParams] = useSearchParams();
  const fmbId = searchParams.get("fmbId") || undefined;
  const fmbTakhmeenId = searchParams.get("fmbTakhmeenId") || undefined;
  const fmbContributionId = searchParams.get("fmbContributionId") || undefined;

  const defaultAllocations = useMemo(() => {
    if (fmbContributionId) {
      return [
        {
          lineKind: LINE_KIND.CONTRIBUTION,
          fmbContributionId,
          fmbTakhmeenId: null,
          amount: "",
        },
      ];
    }
    if (fmbTakhmeenId) {
      return [
        {
          lineKind: LINE_KIND.ANNUAL,
          fmbTakhmeenId,
          fmbContributionId: null,
          amount: "",
        },
      ];
    }
    return [
      {
        lineKind: LINE_KIND.ANNUAL,
        fmbTakhmeenId: null,
        fmbContributionId: null,
        amount: "",
      },
    ];
  }, [fmbTakhmeenId, fmbContributionId]);

  const defaultValues = useMemo(
    () => ({
      fmbId,
      paymentMode: "CASH",
      receiptDate: new Date(),
      amountConfirmed: false,
      creditUsed: 0,
      allocations: [],
    }),
    [fmbId],
  );

  const validateFmbReceiptForm = (values) => {
    const errors = {};
    if (!values.amountConfirmed) {
      errors.amount = "Confirm the total payment amount before saving.";
    }
    return errors;
  };

  const optionRenderer = (choice) => {
    const its = choice?.itsNo ?? choice?.itsdata?.ITS_ID ?? "—";
    const name = choice?.itsdata?.Full_Name ?? choice?.name ?? "—";
    const fmbNoLabel = choice?.fileNo ? `File ${choice.fileNo}` : "File —";
    const area = choice?.itsdata?.Area ? ` · ${choice.itsdata.Area}` : "";
    const status = choice?.closedAt ? " · CLOSED" : "";
    return `${its} · ${name} · ${fmbNoLabel}${area}${status}`;
  };

  const transform = (data) => {
    const cash = Number(data.amount);
    const creditUsed = Number(data.creditUsed) || 0;
    const amount =
      (Number.isFinite(cash) ? cash : 0) + (Number.isFinite(creditUsed) ? creditUsed : 0);
    const rows = Array.isArray(data.allocations) ? data.allocations : [];
    const allocations = rows
      .map((row) => {
        const lineAmt = Number(row?.amount);
        if (!Number.isFinite(lineAmt) || lineAmt < 1) {
          return null;
        }
        const kind =
          row?.lineKind === LINE_KIND.CONTRIBUTION ? LINE_KIND.CONTRIBUTION : LINE_KIND.ANNUAL;
        if (kind === LINE_KIND.CONTRIBUTION) {
          const cid = row?.fmbContributionId?.trim();
          if (!cid) {
            return null;
          }
          return { fmbContributionId: cid, amount: Math.round(lineAmt) };
        }
        const tid = row?.fmbTakhmeenId?.trim();
        if (!tid) {
          return null;
        }
        return { fmbTakhmeenId: tid, amount: Math.round(lineAmt) };
      })
      .filter(Boolean);

    const out = {
      fmbId: data.fmbId?.trim() || undefined,
      amount: Number.isFinite(amount) ? Math.round(amount) : 0,
      creditUsed: Number.isFinite(creditUsed) ? Math.round(creditUsed) : 0,
      paymentMode: data.paymentMode,
      remarks: data.remarks,
      allocations,
    };
    if (data.receiptDate) {
      const d = data.receiptDate instanceof Date ? data.receiptDate : new Date(data.receiptDate);
      if (!Number.isNaN(d.getTime())) {
        out.receiptDate = d.toISOString();
      }
    }
    return out;
  };

  return (
    <Create {...props} transform={transform}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 760 }}
        defaultValues={defaultValues}
        validate={validateFmbReceiptForm}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <ReferenceInput source="fmbId" reference="fmbData">
              <ITSInput
                fullWidth
                size="medium"
                label="ITS No."
                optionText={optionRenderer}
                shouldRenderSuggestions={(val) => val.trim().length > 3}
                noOptionsText="Enter valid ITS No."
                syncAnnualContext
              />
            </ReferenceInput>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput source="name" label="FMB account holder name" fullWidth disabled />
          </Grid>
        </Grid>

        <FmbPaymentCreditReadout />

        <PaymentTotalAndAllocationsSection allocationTemplate={defaultAllocations} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DateInput source="receiptDate" label="Receipt date" fullWidth />
          </Grid>
        </Grid>

        <RadioButtonGroupInput
          source="paymentMode"
          label="Payment mode"
          choices={[
            { id: "CASH", name: "CASH" },
            { id: "ONLINE", name: "ONLINE" },
            { id: "CHEQUE", name: "CHEQUE" },
          ]}
          fullWidth
          validate={[required()]}
        />
        <TextInput source="remarks" fullWidth />
      </SimpleForm>
    </Create>
  );
}
