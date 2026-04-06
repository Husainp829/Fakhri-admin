import React, { useEffect, useMemo, useState } from "react";
import { useShowContext } from "react-admin";
import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { callApi } from "@/dataprovider/misc-apis";
import { formatINR } from "@/utils";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

const money = (n) => formatINR(Number(n || 0));

function TotalTile({ title, value, subtitle, color = "text.primary" }) {
  return (
    <Paper sx={{ p: 2, height: "100%" }} elevation={1}>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }} color={color}>
        {value}
      </Typography>
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      ) : null}
    </Paper>
  );
}

export default function PeriodTotalsTab() {
  const { record } = useShowContext();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState({ takhmeens: [], contributions: [], receipts: [] });
  const [error, setError] = useState(null);

  const periodStart = record?.fmbTakhmeenCurrent?.hijriYearStart ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!record?.id || periodStart == null) {
      setRows({ takhmeens: [], contributions: [], receipts: [] });
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [takhmeenRes, contributionRes, receiptRes] = await Promise.all([
          callApi({
            location: "fmbTakhmeen",
            method: "GET",
            data: { fmbId: record.id, hijriYearStart: periodStart, limit: 200, startAfter: 0 },
          }),
          callApi({
            location: "fmbContributions",
            method: "GET",
            data: { fmbId: record.id, hijriYearStart: periodStart, limit: 500, startAfter: 0 },
          }),
          callApi({
            location: "fmbReceipt",
            method: "GET",
            data: { fmbId: record.id, limit: 500, startAfter: 0 },
          }),
        ]);

        if (!cancelled) {
          setRows({
            takhmeens: takhmeenRes?.data?.rows ?? [],
            contributions: contributionRes?.data?.rows ?? [],
            receipts: receiptRes?.data?.rows ?? [],
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load period totals");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [record?.id, periodStart]);

  const totals = useMemo(() => {
    const annualCommitted = rows.takhmeens.reduce(
      (sum, t) => sum + Number(t?.takhmeenAmount || 0),
      0
    );
    const annualPending = rows.takhmeens.reduce(
      (sum, t) => sum + Number(t?.pendingBalance || 0),
      0
    );
    const contributionCommitted = rows.contributions.reduce(
      (sum, c) => sum + Number(c?.amount || 0),
      0
    );
    const contributionIds = new Set(rows.contributions.map((c) => c.id));
    const takhmeenIds = new Set(rows.takhmeens.map((t) => t.id));
    const receiptsAnnual = rows.receipts
      .filter((r) => r?.fmbTakhmeenId && takhmeenIds.has(r.fmbTakhmeenId))
      .reduce((sum, r) => sum + Number(r?.amount || 0), 0);
    const receiptsContrib = rows.receipts
      .filter((r) => r?.fmbContributionId && contributionIds.has(r.fmbContributionId))
      .reduce((sum, r) => sum + Number(r?.amount || 0), 0);
    const contributionPending = Math.max(0, contributionCommitted - receiptsContrib);
    return {
      annualCommitted,
      contributionCommitted,
      combinedCommitted: annualCommitted + contributionCommitted,
      receiptsAnnual,
      receiptsContrib,
      combinedReceipts: receiptsAnnual + receiptsContrib,
      annualPending,
      contributionPending,
      combinedPending: annualPending + contributionPending,
    };
  }, [rows]);

  if (periodStart == null) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">
          No active Hijri period found for this FMB. Create/update a takhmeen period first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Period totals: {formatFmbHijriPeriod(periodStart)}
      </Typography>
      {/* eslint-disable-next-line no-nested-ternary */}
      {loading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TotalTile
              title="Annual commitment"
              value={money(totals.annualCommitted)}
              subtitle={`Receipts: ${money(totals.receiptsAnnual)} · Pending: ${money(totals.annualPending)}`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TotalTile
              title="Contributions"
              value={money(totals.contributionCommitted)}
              subtitle={`Receipts: ${money(totals.receiptsContrib)} · Pending: ${money(totals.contributionPending)}`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TotalTile
              title="Combined totals"
              value={money(totals.combinedCommitted)}
              subtitle={`Receipts: ${money(totals.combinedReceipts)} · Pending: ${money(totals.combinedPending)}`}
              color="primary.main"
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
