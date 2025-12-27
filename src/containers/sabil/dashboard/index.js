import React, { useState, useEffect, useMemo } from "react";
import { Title, useRedirect } from "react-admin";
import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { callApi } from "../../../dataprovider/miscApis";
import { COLORS } from "./constants";
import DateRangeFilter from "./components/DateRangeFilter";
import DashboardHeader from "./components/DashboardHeader";
import FinancialMetrics from "./components/FinancialMetrics";
import ChartsRow from "./components/ChartsRow";
import CollectionProgress from "./components/CollectionProgress";
import ActiveSabilsCount from "./components/ActiveSabilsCount";
import TakhmeenAmountTables from "./components/TakhmeenAmountTables";

// Helper function to get default date range (current financial year)
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

// Helper function to get date range from URL params
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

// Helper function to update URL params with date range
const updateURLParams = (startDate, endDate) => {
  if (typeof window === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);

  if (startDate) {
    urlParams.set("startDate", startDate);
  } else {
    urlParams.delete("startDate");
  }

  if (endDate) {
    urlParams.set("endDate", endDate);
  } else {
    urlParams.delete("endDate");
  }

  const queryString = urlParams.toString();
  const newUrl = queryString
    ? `${window.location.pathname}?${queryString}`
    : window.location.pathname;
  window.history.replaceState({}, "", newUrl);
};

export default function SabilDashboard() {
  const redirect = useRedirect();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  // Initialize date range from URL params or default
  const initialDateRange = getDateRangeFromURL();
  const [startDate, setStartDate] = useState(initialDateRange.startDate);
  const [endDate, setEndDate] = useState(initialDateRange.endDate);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const response = await callApi({
        location: "sabilLedger",
        method: "GET",
        id: `dashboard/stats?${queryParams.toString()}`,
      });
      if (response?.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Initialize from URL params on mount and sync on URL changes
  useEffect(() => {
    // Fetch stats on mount (dates are already initialized from URL)
    fetchStats();

    // Listen for browser back/forward navigation
    const handlePopState = () => {
      const urlDateRange = getDateRangeFromURL();
      setStartDate(urlDateRange.startDate);
      setEndDate(urlDateRange.endDate);
      fetchStats();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleStartDateChange = (newStartDate) => {
    setStartDate(newStartDate);
    updateURLParams(newStartDate, endDate);
  };

  const handleEndDateChange = (newEndDate) => {
    setEndDate(newEndDate);
    updateURLParams(startDate, newEndDate);
  };

  const handleDateRangeChange = () => {
    updateURLParams(startDate, endDate);
    fetchStats();
  };

  const handleViewNotPaidSabils = () => {
    // Navigate to sabilData list with filter for sabils not paid for 2+ years
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

  // Prepare chart data - must be before early returns
  const financialData = useMemo(
    () =>
      stats
        ? [
            {
              name: "Forecast",
              value: stats.sabilForecast || 0,
              color: COLORS[0],
            },
            {
              name: "Received",
              value: stats.paymentsReceived || 0,
              color: COLORS[1],
            },
            {
              name: "Pending",
              value: stats.paymentsPending || 0,
              color: COLORS[2],
            },
            {
              name: "Written Off",
              value: stats.writeoffAmount || 0,
              color: COLORS[3],
            },
          ]
        : [],
    [stats]
  );

  const sabilTypeData = useMemo(
    () =>
      stats
        ? [
            {
              name: "CHULA",
              value: stats.activeSabils?.chula || 0,
              color: COLORS[0],
            },
            {
              name: "ESTABLISHMENT",
              value: stats.activeSabils?.establishment || 0,
              color: COLORS[1],
            },
          ]
        : [],
    [stats]
  );

  const collectionPercentage = useMemo(() => {
    if (!stats?.sabilForecast || stats.sabilForecast === 0) return 0;
    return Math.round((stats.paymentsReceived / stats.sabilForecast) * 100);
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
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onApply={handleDateRangeChange}
      />

      <DashboardHeader
        financialYear={stats.financialYear}
        collectionPercentage={collectionPercentage}
      />

      <FinancialMetrics stats={stats} onViewNotPaidSabils={handleViewNotPaidSabils} />

      <ChartsRow financialData={financialData} sabilTypeData={sabilTypeData} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <CollectionProgress stats={stats} collectionPercentage={collectionPercentage} />
        </Grid>
        <Grid item size={{ xs: 12, md: 6 }}>
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
