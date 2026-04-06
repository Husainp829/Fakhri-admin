import { useState, useEffect, useMemo, useCallback } from "react";
import { Title, useRedirect } from "react-admin";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { callApi } from "@/dataprovider/misc-apis";
import { COLORS } from "./constants";
import DashboardHeader from "./components/DashboardHeader";
import FmbMetrics from "./components/FmbMetrics";
import FmbChartsRow from "./components/FmbChartsRow";
import FmbCollectionProgress from "./components/FmbCollectionProgress";
import ActiveFmbCounts from "./components/ActiveFmbCounts";
import FmbTakhmeenAmountTables from "./components/FmbTakhmeenAmountTables";
import FmbPeriodFilter, { type FmbDashboardPeriod } from "./components/FmbPeriodFilter";

import type { ChartDatum } from "@/containers/sabil/dashboard/components/ChartsRow";

type FmbDashboardStats = {
  periodLabel?: string;
  hijriYearStart?: number;
  paymentsReceived?: number;
  paymentsPending?: number;
  fmbForecast?: number;
  takhmeenAmountCountsByType?: Record<
    string,
    { amount: number; count: number; fmbIds?: string[] }[]
  >;
  deliveryProfileDistribution?: { name?: string; value?: number }[];
  activeFmb?: {
    activeThalis?: number;
    inactiveThalis?: number;
    total?: number;
  };
  fmbNotPaid2Years?: { count?: number };
};

export default function FmbDashboard() {
  const redirect = useRedirect();
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [periods, setPeriods] = useState<FmbDashboardPeriod[]>([]);
  const [selectedHijriStart, setSelectedHijriStart] = useState<number | null>(null);
  const [stats, setStats] = useState<FmbDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPeriodsLoading(true);
      setError(null);
      try {
        const res = await callApi({
          location: "fmbReceipt",
          method: "GET",
          id: "dashboard/periods",
        });
        const list = (res?.data as { periods?: FmbDashboardPeriod[] } | undefined)?.periods ?? [];
        if (!cancelled) {
          setPeriods(list);
          if (list.length > 0) {
            setSelectedHijriStart(list[0].hijriYearStart);
          } else {
            setSelectedHijriStart(null);
          }
        }
      } catch (err) {
        console.error("Error fetching FMB dashboard periods:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load periods");
        }
      } finally {
        if (!cancelled) {
          setPeriodsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchStats = useCallback(async (hijriYearStart: number | null) => {
    setStatsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (hijriYearStart != null && !Number.isNaN(hijriYearStart)) {
        qs.append("hijriYearStart", String(hijriYearStart));
      }
      const q = qs.toString();
      const response = await callApi({
        location: "fmbReceipt",
        method: "GET",
        id: q ? `dashboard/stats?${q}` : "dashboard/stats",
      });
      if (response?.data) {
        setStats(response.data as FmbDashboardStats);
      }
    } catch (err) {
      console.error("Error fetching FMB dashboard stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (periodsLoading) {
      return;
    }
    fetchStats(selectedHijriStart);
  }, [periodsLoading, selectedHijriStart, fetchStats]);

  const handlePeriodChange = (hijriYearStart: number) => {
    setSelectedHijriStart(hijriYearStart);
  };

  const financialData = useMemo((): ChartDatum[] => {
    if (!stats) {
      return [];
    }
    const byType = stats.takhmeenAmountCountsByType || {};
    const sumType = (key: string) =>
      (byType[key] || []).reduce(
        (sum, row) => sum + Number(row.amount || 0) * Number(row.count || 0),
        0
      );
    const annualCommitted = sumType("ANNUAL");
    const zabihatCommitted = sumType("ZABIHAT");
    const voluntaryCommitted = sumType("VOLUNTARY");
    return [
      {
        name: "Annual",
        value: annualCommitted,
        color: COLORS[0],
      },
      {
        name: "Contributions",
        value: zabihatCommitted + voluntaryCommitted,
        color: COLORS[1],
      },
      {
        name: "Received",
        value: stats.paymentsReceived || 0,
        color: COLORS[2],
      },
      {
        name: "Pending",
        value: stats.paymentsPending || 0,
        color: COLORS[3],
      },
    ];
  }, [stats]);

  const deliveryProfileData = useMemo(() => {
    if (!stats?.deliveryProfileDistribution?.length) {
      return [];
    }
    return stats.deliveryProfileDistribution.map((row, i) => ({
      ...row,
      color: COLORS[i % COLORS.length],
    }));
  }, [stats]);

  const collectionPercentage = useMemo(() => {
    if (!stats?.fmbForecast || stats.fmbForecast === 0) return 0;
    return Math.min(100, Math.round((stats.paymentsReceived! / stats.fmbForecast) * 100));
  }, [stats]);

  const loading = periodsLoading || statsLoading;

  if (loading && !stats) {
    return (
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Title title="FMB Dashboard" />
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Title title="FMB Dashboard" />
      <FmbPeriodFilter periods={periods} value={selectedHijriStart} onChange={handlePeriodChange} />
      <DashboardHeader
        periodLabel={stats.periodLabel}
        hijriYearStart={stats.hijriYearStart}
        collectionPercentage={collectionPercentage}
      />
      <FmbMetrics stats={stats} />
      <FmbChartsRow financialData={financialData} deliveryProfileData={deliveryProfileData} />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <FmbCollectionProgress stats={stats} collectionPercentage={collectionPercentage} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <ActiveFmbCounts activeFmb={stats.activeFmb} />
        </Grid>
      </Grid>
      {stats.takhmeenAmountCountsByType &&
        Object.keys(stats.takhmeenAmountCountsByType).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <FmbTakhmeenAmountTables
              takhmeenAmountCountsByType={stats.takhmeenAmountCountsByType}
              redirect={redirect}
            />
          </Box>
        )}
    </Box>
  );
}
