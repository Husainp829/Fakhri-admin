import React, { useEffect, useMemo, useState } from "react";
import { Title } from "react-admin";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { callApi } from "../../../dataprovider/miscApis";
import DateRangeFilter from "../../../components/DateRangeFilter";

dayjs.extend(utc);

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#8dd1e1", "#a4de6c"];

function fmt(n) {
  if (n === null || n === undefined) return "0";
  return Number(n).toLocaleString();
}

function StatCard({ title, value, subtitle, color = "primary" }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" color={color}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function BookingDashboard() {
  const now = dayjs.utc();
  const defaultStartDate = now.startOf("month").format("YYYY-MM-DD");
  const defaultEndDate = now.endOf("month").format("YYYY-MM-DD");

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const [loading, setLoading] = useState(true);
  const [halls, setHalls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalRent, setTotalRent] = useState(0);
  const [error, setError] = useState(null);

  const fetchBookingStats = async (sDate, eDate) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { startDate: sDate, endDate: eDate };
      const resp = await callApi({ location: "bookingStats", data: payload, method: "GET" });
      const json = resp && resp.data ? resp.data : {};

      const hallsCandidate = json.hallStats || [];
      const summaryCandidate = json.bookingStats || {};
      const totalRentValue = Number(json.totalRent || 0);

      setHalls(
        hallsCandidate.map((r) => ({
          ...r,
          rent: Number(r.rent || 0),
          hallCount: Number(r.hallCount || 0),
          occupancyPercentage: Number(r.occupancyPercentage || 0),
        }))
      );

      setTotalRent(totalRentValue);

      setSummary({
        paidAmount: Number(summaryCandidate.paidAmount || 0),
        depositPaidAmount: Number(summaryCandidate.depositPaidAmount || 0),
        refundReturnAmount: Number(summaryCandidate.refundReturnAmount || 0),
        writeOffAmount: Number(summaryCandidate.writeOffAmount || 0),
        extraExpenses: Number(summaryCandidate.extraExpenses || 0),
        jamaatLagat: Number(summaryCandidate.jamaatLagat || 0),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || err);
      setHalls([]);
      setSummary(null);
      setTotalRent(0);
    } finally {
      setLoading(false);
    }
  };

  // Initialize from URL params on mount
  useEffect(() => {
    // Get date range from URL or use defaults
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStartDate = urlParams.get("startDate");
      const urlEndDate = urlParams.get("endDate");

      if (urlStartDate && urlEndDate) {
        setStartDate(urlStartDate);
        setEndDate(urlEndDate);
        fetchBookingStats(urlStartDate, urlEndDate);
        return;
      }
    }

    // Use defaults if no URL params
    fetchBookingStats(defaultStartDate, defaultEndDate);
    // eslint-disable-next-line
  }, []);

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetchBookingStats(newStartDate, newEndDate);
  };

  const selectedDateRange = useMemo(
    () => `${format(parseISO(startDate), "MMM d")} - ${format(parseISO(endDate), "MMM d")}`,
    [startDate, endDate]
  );

  // Calculate totals
  const totalBookings = halls.reduce((sum, h) => sum + h.hallCount, 0);
  const avgOccupancy =
    halls.length > 0
      ? Math.round(halls.reduce((sum, h) => sum + h.occupancyPercentage, 0) / halls.length)
      : 0;

  // Prepare chart data
  const rentBarData = halls.map((h) => ({
    name: h.name || h.hallId,
    rent: h.rent,
  }));

  const occupancyBarData = halls.map((h) => ({
    name: h.name || h.hallId,
    occupancy: h.occupancyPercentage,
  }));

  const bookingBreakdown = summary
    ? [
        { name: "Paid", value: summary.paidAmount },
        { name: "Deposits", value: summary.depositPaidAmount },
        { name: "Refunds", value: summary.refundReturnAmount },
        { name: "WriteOff", value: summary.writeOffAmount },
        { name: "Extra Expenses", value: summary.extraExpenses },
        { name: "Jamaat Lagat", value: summary.jamaatLagat },
      ].filter((d) => d.value && d.value !== 0)
    : [];

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
        <Title title="Booking Dashboard" />
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">Error: {error}</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Title title="Booking Dashboard" />
        <Chip label={selectedDateRange} color="primary" variant="outlined" />
      </Box>

      <DateRangeFilter
        defaultStartDate={defaultStartDate}
        defaultEndDate={defaultEndDate}
        onDateChange={handleDateRangeChange}
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={`₹${fmt(totalRent)}`}
            subtitle={selectedDateRange}
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Bookings"
            value={fmt(totalBookings)}
            subtitle={selectedDateRange}
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average Occupancy"
            value={`${avgOccupancy}%`}
            subtitle="Across all halls"
          />
        </Grid>
        <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Paid Amount"
            value={`₹${fmt(summary?.paidAmount || 0)}`}
            subtitle="From bookings"
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rent per Hall
              </Typography>
              {halls.length === 0 ? (
                <Box height={300} display="flex" alignItems="center" justifyContent="center">
                  <Typography color="textSecondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rentBarData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                    <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} interval={0} />
                    <YAxis />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    <Bar dataKey="rent" name="Rent" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Occupancy Percentage
              </Typography>
              {halls.length === 0 ? (
                <Box height={300} display="flex" alignItems="center" justifyContent="center">
                  <Typography color="textSecondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={occupancyBarData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
                  >
                    <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} interval={0} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="occupancy" name="Occupancy" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking Funds Breakdown
              </Typography>
              {!summary || bookingBreakdown.length === 0 ? (
                <Box height={300} display="flex" alignItems="center" justifyContent="center">
                  <Typography color="textSecondary">No data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookingBreakdown}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      label={(entry) => `${entry.name}: ₹${Number(entry.value).toLocaleString()}`}
                    >
                      {bookingBreakdown.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking Summary
              </Typography>
              {!summary ? (
                <Box height={300} display="flex" alignItems="center" justifyContent="center">
                  <Typography color="textSecondary">No data available</Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Paid Amount
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ₹{fmt(summary.paidAmount)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Deposits
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ₹{fmt(summary.depositPaidAmount)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Refunds
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ₹{fmt(summary.refundReturnAmount)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Write Off
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="warning.main">
                        ₹{fmt(summary.writeOffAmount)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Extra Expenses
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ₹{fmt(summary.extraExpenses)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Jamaat Lagat
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ₹{fmt(summary.jamaatLagat)}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
