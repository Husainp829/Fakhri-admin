import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { Title, useRedirect } from "react-admin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { callApi } from "@/dataprovider/misc-apis";

type PaymentBreakdown = { mode: string; total: number; count: number };

type DashboardSummary = {
  hijriYear: string;
  totalCount: number;
  fullyPaidCount: number;
  partialPaidCount: number;
  pendingCount: number;
  totalTakhmeen: number;
  totalZabihatCount: number;
  totalZabihatTotal: number;
  totalPayable: number;
  totalPaid: number;
  totalPending: number;
  paymentBreakdown: PaymentBreakdown[];
};

const fmt = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const fmtShort = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

const FinancialBarChart = ({ summary }: { summary: DashboardSummary }) => {
  const theme = useTheme();
  const data = [
    { name: "Takhmeen", value: summary.totalTakhmeen, color: theme.palette.primary.main },
    { name: "Zabihat", value: summary.totalZabihatTotal, color: theme.palette.info.main },
    { name: "Total Payable", value: summary.totalPayable, color: theme.palette.warning.main },
    { name: "Received", value: summary.totalPaid, color: theme.palette.success.main },
    { name: "Pending", value: summary.totalPending, color: theme.palette.error.main },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Financial Overview
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={fmtShort} />
            <Tooltip formatter={(value) => fmt(Number(value))} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const PaidPendingPieChart = ({ summary }: { summary: DashboardSummary }) => {
  const theme = useTheme();
  const data = [
    { name: "Paid", value: summary.totalPaid, color: theme.palette.success.main },
    { name: "Pending", value: summary.totalPending, color: theme.palette.error.main },
  ].filter((d) => d.value > 0);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Paid vs Pending
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={(props) =>
                `${String(props.name ?? "")} (${(Number(props.percent ?? 0) * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => fmt(Number(value))} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const PaidPendingDonut = ({ summary }: { summary: DashboardSummary }) => {
  const theme = useTheme();
  const data = [
    { name: "Fully Paid", value: summary.fullyPaidCount, color: theme.palette.success.main },
    { name: "Partial", value: summary.partialPaidCount, color: theme.palette.info.main },
    { name: "Pending", value: summary.pendingCount, color: theme.palette.warning.main },
  ].filter((d) => d.value > 0);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Entries: Paid vs Pending
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              paddingAngle={3}
              label={(props) => `${String(props.name ?? "")}: ${Number(props.value ?? 0)}`}
              labelLine={false}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const YearlyNiyaazDashboard = () => {
  const redirect = useRedirect();
  const [loading, setLoading] = useState(true);
  const [hijriYears, setHijriYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    callApi({ location: "yearlyNiyaaz", method: "GET", id: "hijri-years" })
      .then((res) => {
        const years = res.data as string[];
        setHijriYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    setLoading(true);
    callApi({
      location: "yearlyNiyaaz",
      method: "GET",
      id: `dashboard/summary?hijriYear=${selectedYear}`,
    })
      .then((res) => {
        setSummary(res.data as DashboardSummary);
      })
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const summaryCards: {
    label: string;
    value: string | number;
    color?: string;
    subtitle?: string;
  }[] = summary
    ? [
        { label: "Total Entries", value: summary.totalCount },
        { label: "Total Zabihat", value: summary.totalZabihatCount },
        {
          label: "Total Payable",
          value: fmt(summary.totalPayable),
          subtitle: `Takhmeen: ${fmt(summary.totalTakhmeen)} + Zabihat: ${fmt(summary.totalZabihatTotal)}`,
        },
        {
          label: "Total Received",
          value: fmt(summary.totalPaid),
          color: "success.main",
        },
        {
          label: "Total Pending",
          value: fmt(summary.totalPending),
          color: summary.totalPending > 0 ? "error.main" : "success.main",
        },
        {
          label: "Fully Paid",
          value: `${summary.fullyPaidCount} / ${summary.totalCount}`,
          color: "success.main",
          subtitle: `${summary.partialPaidCount} partial, ${summary.pendingCount} pending`,
        },
      ]
    : [];

  return (
    <Box sx={{ p: 3 }}>
      <Title title="Yearly Niyaaz Dashboard" />

      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h5" fontWeight={600} sx={{ mr: 2 }}>
          Yearly Niyaaz Dashboard
        </Typography>
        {hijriYears.length > 0 && (
          <TextField
            select
            label="Hijri Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ minWidth: 160 }}
            size="small"
          >
            {hijriYears.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        )}
        <Button variant="outlined" onClick={() => redirect("/yearlyNiyaaz")}>
          View All Niyaaz
        </Button>
        <Button variant="outlined" onClick={() => redirect("/yearlyNiyaazReceipts")}>
          View Receipts
        </Button>
        <Button variant="contained" onClick={() => redirect("/yearlyNiyaaz/create")}>
          Add Niyaaz
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !summary && hijriYears.length === 0 && (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No yearly niyaaz data found. Create your first entry to get started.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && summary && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {summaryCards.map((card) => (
              <Grid key={card.label} size={{ xs: 6, sm: 4, md: 2 }}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={card.color || "text.primary"}>
                      {card.value}
                    </Typography>
                    {card.subtitle && (
                      <Typography variant="caption" color="text.secondary">
                        {card.subtitle}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Progress Bar */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Collection Progress
              </Typography>
              <Box
                sx={(theme) => ({
                  position: "relative",
                  height: 40,
                  borderRadius: 2,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.common.white, 0.12)
                      : theme.palette.grey[200],
                })}
              >
                <Box
                  sx={(theme) => ({
                    position: "absolute",
                    height: "100%",
                    width: `${summary.totalPayable > 0 ? Math.min((summary.totalPaid / summary.totalPayable) * 100, 100) : 0}%`,
                    bgcolor: alpha(theme.palette.success.main, 0.8),
                    borderRadius: 2,
                    transition: "width 0.5s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  })}
                >
                  <Typography variant="body2" fontWeight={600} color="white">
                    {summary.totalPayable > 0
                      ? `${((summary.totalPaid / summary.totalPayable) * 100).toFixed(1)}%`
                      : "0%"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Received: {fmt(summary.totalPaid)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending: {fmt(summary.totalPending)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {fmt(summary.totalPayable)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FinancialBarChart summary={summary} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PaidPendingDonut summary={summary} />
            </Grid>
          </Grid>

          {/* Payment Mode Chart + Table */}
          {summary.paymentBreakdown.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <PaidPendingPieChart summary={summary} />
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Payments by Mode
                    </Typography>
                    <TableContainer component={Paper} elevation={0}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Payment Mode</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Receipts
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Amount
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {summary.paymentBreakdown.map((row) => (
                            <TableRow key={row.mode} hover>
                              <TableCell>{row.mode}</TableCell>
                              <TableCell align="right">{row.count}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {fmt(row.total)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <Divider />
                          </TableRow>
                          <TableRow
                            sx={(theme) => ({
                              bgcolor: alpha(theme.palette.success.main, 0.08),
                            })}
                          >
                            <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              {summary.paymentBreakdown.reduce((s, r) => s + r.count, 0)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              {fmt(summary.totalPaid)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default YearlyNiyaazDashboard;
