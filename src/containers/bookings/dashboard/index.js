/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
// src/reports/EventStatsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Title } from "react-admin";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  TextField,
  Button,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
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

import { callApi } from "../../../dataprovider/miscApis";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#8dd1e1", "#a4de6c"];

function fmt(n) {
  if (n === null || n === undefined) return "0";
  return Number(n).toLocaleString();
}

export default function BookingDashboard() {
  // default dates from your SQL example
  const [startDate, setStartDate] = useState("2025-11-01"); // booking summary
  const [endDate, setEndDate] = useState("2025-11-30");

  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [halls, setHalls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // Unified fetch: /bookingStats returns both halls and summary in one response
  const fetchBookingStats = async (sDate, eDate) => {
    // two loaders: one for halls chart and one for summary area
    setLoading(true);
    setLoadingSummary(true);
    setError(null);
    try {
      // callAPI expected to wrap fetch and return parsed json or throw on non-2xx
      const payload = { startDate: sDate, endDate: eDate };
      const resp = await callApi({ location: "bookingStats", data: payload, method: "GET" });
      const json = resp && resp.data ? resp.data : {};

      // backend may return { halls: [...], summary: {...} } or { data: { halls, summary } }
      console.log(json);
      const hallsCandidate = json.hallStats;
      const hallsData = Array.isArray(hallsCandidate) ? hallsCandidate : [];

      const summaryCandidate = json.bookingStats;

      setHalls(
        (hallsData || []).map((r) => ({
          ...r,
          rent: Number(r.rent || 0),
          hallCount: Number(r.hallCount || r.count || 0),
        }))
      );

      const obj = summaryCandidate || {};
      setSummary({
        paidAmount: Number(obj.paidAmount || 0),
        depositPaidAmount: Number(obj.depositPaidAmount || 0),
        refundReturnAmount: Number(obj.refundReturnAmount || 0),
        writeOffAmount: Number(obj.writeOffAmount || 0),
        extraExpenses: Number(obj.extraExpenses || 0),
        jamaatLagat: Number(obj.jamaatLagat || 0),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || err);
      setHalls([]);
      setSummary(null);
    } finally {
      setLoading(false);
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchBookingStats(startDate, endDate);
    // eslint-disable-next-line
  }, []);

  const onRefresh = () => {
    fetchBookingStats(startDate, endDate);
  };

  // Prepare chart data
  const rentBarData = halls.map((h) => ({ name: h.name || h.hallId, rent: Number(h.rent || 0) }));
  const countPieData = halls.map((h, i) => ({
    name: h.name || h.hallId,
    value: Number(h.hallCount || 0),
    color: COLORS[i % COLORS.length],
  }));

  // booking summary pie data (breakdown)
  const bookingBreakdown = summary
    ? [
        { name: "Paid", value: summary.paidAmount },
        { name: "Deposits", value: summary.depositPaidAmount },
        { name: "Refunds", value: summary.refundReturnAmount },
        { name: "WriteOff", value: summary.writeOffAmount },
        { name: "ExtraExpenses", value: summary.extraExpenses },
        { name: "JamaatLagat", value: summary.jamaatLagat },
      ]
    : [];

  const selectedDate = useMemo(
    () => `${format(parseISO(startDate), "MMM d")} - ${format(parseISO(endDate), "MMM d")}`,
    [startDate, endDate]
  );
  return (
    <Box sx={{ p: 2 }}>
      <Title title="Event / Hall statistics" />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Bookings range</Typography>
              <TextField
                label="Start date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                label="End date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
              <Box mt={1} display="flex" gap={1}>
                <Button variant="contained" onClick={onRefresh}>
                  Load Summary
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Summary cards */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Total Rent ({selectedDate})</Typography>
                  <Typography variant="h5">
                    ₹{fmt(halls.reduce((s, r) => s + (Number(r.rent) || 0), 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Total Hall Count ({selectedDate})</Typography>
                  <Typography variant="h5">
                    {fmt(halls.reduce((s, r) => s + (Number(r.hallCount) || 0), 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Booking totals */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">Bookings summary ({selectedDate})</Typography>
                  {loadingSummary ? (
                    <Box display="flex" alignItems="center" justifyContent="center" p={2}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : summary ? (
                    <Grid container spacing={1}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption">Paid</Typography>
                        <Typography variant="subtitle1">₹{fmt(summary.paidAmount)}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption">Deposits</Typography>
                        <Typography variant="subtitle1">
                          ₹{fmt(summary.depositPaidAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption">Refunds</Typography>
                        <Typography variant="subtitle1">
                          ₹{fmt(summary.refundReturnAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption">WriteOff</Typography>
                        <Typography variant="subtitle1">₹{fmt(summary.writeOffAmount)}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption">ExtraExpenses</Typography>
                        <Typography variant="subtitle1">₹{fmt(summary.extraExpenses)}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption">JamaatLagat</Typography>
                        <Typography variant="subtitle1">₹{fmt(summary.jamaatLagat)}</Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography color="error">No summary data</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        {/* Charts area */}
        <Grid item xs={12} md={6}>
          <Card style={{ height: 360 }}>
            <CardContent style={{ height: "100%" }}>
              <Typography variant="h6">Rent per Hall</Typography>
              {loading ? (
                <Box height={240} display="flex" alignItems="center" justifyContent="center">
                  <CircularProgress />
                </Box>
              ) : halls.length === 0 ? (
                <Typography>No hall data for selected date</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
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
        <Grid item xs={12} md={6}>
          <Card style={{ height: 360 }}>
            <CardContent style={{ height: "100%" }}>
              <Typography variant="h6">Hall counts</Typography>
              {loading ? (
                <Box height={240} display="flex" alignItems="center" justifyContent="center">
                  <CircularProgress />
                </Box>
              ) : halls.length === 0 ? (
                <Typography>No hall data for selected date</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={countPieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label={(entry) => `${entry.name} (${entry.value})`}
                    >
                      {countPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => `${v}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        {/* Booking breakdown pie */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Booking funds breakdown (range)</Typography>
              {loadingSummary || !summary ? (
                <Box height={200} display="flex" alignItems="center" justifyContent="center">
                  <CircularProgress />
                </Box>
              ) : (
                <Box height={360}>
                  <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                      <Pie
                        data={bookingBreakdown.filter((d) => d.value && d.value !== 0)}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        label={(entry) => `${entry.name} (${Number(entry.value).toLocaleString()})`}
                      >
                        {bookingBreakdown.map((entry, idx) => (
                          <Cell key={`b-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error */}
      {error && (
        <Box mt={2}>
          <Typography color="error">Error: {String(error)}</Typography>
        </Box>
      )}
    </Box>
  );
}
