import { useState, useEffect, useMemo } from "react";
import { Title, useRedirect } from "react-admin";
import { Box, CircularProgress, Paper, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";
import { callApi } from "@/dataprovider/misc-apis";
import { getChartColorSequence } from "@/theme/chartPalette";
import DateRangeFilter from "@/components/DateRangeFilter";
import DashboardHeader from "./components/DashboardHeader";
import FinancialMetrics from "./components/FinancialMetrics";
import ChartsRow from "./components/ChartsRow";
import CollectionProgress from "./components/CollectionProgress";
import ActiveSabilsCount from "./components/ActiveSabilsCount";
import TakhmeenAmountTables from "./components/TakhmeenAmountTables";
import type { TakhmeenAmountRow } from "./components/TakhmeenAmountTable";

export type SabilDashboardStats = {
  financialYear?: string;
  sabilForecast?: number;
  paymentsReceived?: number;
  paymentsPending?: number;
  writeoffAmount?: number;
  activeSabils?: { chula?: number; establishment?: number; total?: number };
  sabilsNotPaid2Years?: { count?: number };
  takhmeenAmountCountsByType?: Record<string, TakhmeenAmountRow[]>;
};

const getDefaultDateRange = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const fyStartYear = currentMonth >= 4 ? currentYear : currentYear - 1;
  return {
    startDate: `${fyStartYear}-04-01`,
    endDate: `${fyStartYear + 1}-03-31`,
  };
};

const getDateRangeFromURL = () => {
  if (typeof window === "undefined") {
    return getDefaultDateRange();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const startDate = urlParams.get("startDate");
  const endDate = urlParams.get("endDate");

  if (startDate && endDate) {
    return { startDate, endDate };
  }

  return getDefaultDateRange();
};

export default function SabilDashboard() {
  const theme = useTheme();
  const chartColors = useMemo(() => getChartColorSequence(theme), [theme]);
  const redirect = useRedirect();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SabilDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultDateRange = getDefaultDateRange();

  const fetchStats = async (sDate: string, eDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (sDate) queryParams.append("startDate", sDate);
      if (eDate) queryParams.append("endDate", eDate);

      const response = await callApi({
        location: "sabilLedger",
        method: "GET",
        id: `dashboard/stats?${queryParams.toString()}`,
      });
      if (response?.data) {
        setStats(response.data as SabilDashboardStats);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlDateRange = getDateRangeFromURL();
    fetchStats(urlDateRange.startDate, urlDateRange.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    fetchStats(newStartDate, newEndDate);
  };

  const handleViewNotPaidSabils = () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const filters = {
      lastPaidDate_lt: twoYearsAgo.toISOString(),
    };
    const filterParams = new URLSearchParams({
      filter: JSON.stringify(filters),
    });
    redirect(`/sabilData?${filterParams.toString()}`);
  };

  const financialData = useMemo(
    () =>
      stats
        ? [
            { name: "Forecast", value: stats.sabilForecast || 0, color: chartColors[0] },
            { name: "Received", value: stats.paymentsReceived || 0, color: chartColors[1] },
            { name: "Pending", value: stats.paymentsPending || 0, color: chartColors[2] },
            { name: "Written Off", value: stats.writeoffAmount || 0, color: chartColors[3] },
          ]
        : [],
    [stats, chartColors]
  );

  const sabilTypeData = useMemo(
    () =>
      stats
        ? [
            { name: "CHULA", value: stats.activeSabils?.chula || 0, color: chartColors[0] },
            {
              name: "ESTABLISHMENT",
              value: stats.activeSabils?.establishment || 0,
              color: chartColors[1],
            },
          ]
        : [],
    [stats, chartColors]
  );

  const collectionPercentage = useMemo(() => {
    if (!stats?.sabilForecast || stats.sabilForecast === 0) return 0;
    return Math.round((stats.paymentsReceived! / stats.sabilForecast) * 100);
  }, [stats]);

  if (loading) {
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Title title="Sabil Dashboard" />
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
      <Title title="Sabil Dashboard" />
      <DateRangeFilter
        defaultStartDate={defaultDateRange.startDate}
        defaultEndDate={defaultDateRange.endDate}
        onDateChange={handleDateRangeChange}
      />
      <DashboardHeader
        financialYear={stats.financialYear}
        collectionPercentage={collectionPercentage}
      />
      <FinancialMetrics stats={stats} onViewNotPaidSabils={handleViewNotPaidSabils} />
      <ChartsRow financialData={financialData} sabilTypeData={sabilTypeData} />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <CollectionProgress stats={stats} collectionPercentage={collectionPercentage} />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <ActiveSabilsCount activeSabils={stats.activeSabils} />
        </Grid>
      </Grid>
      {stats.takhmeenAmountCountsByType &&
        Object.keys(stats.takhmeenAmountCountsByType).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <TakhmeenAmountTables
              takhmeenAmountCountsByType={stats.takhmeenAmountCountsByType}
              redirect={redirect}
            />
          </Box>
        )}
    </Box>
  );
}
