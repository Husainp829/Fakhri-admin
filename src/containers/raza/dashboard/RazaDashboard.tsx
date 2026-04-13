import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { Title, usePermissions } from "react-admin";
import { hasPermission } from "@/utils/permission-utils";
import { RAZA_DASHBOARD_CARDS } from "@/config/raza-dashboard-cards";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import DateRangeFilter from "@/components/DateRangeFilter";
import { callApi } from "@/dataprovider/misc-apis";
import { useTheme } from "@mui/material/styles";
import { getChartColorSequence } from "@/theme/chartPalette";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

dayjs.extend(utc);

type RazaDashboardJson = {
  totals?: {
    requests?: number;
    granted?: number;
    pending?: number;
    requestedAmount?: number;
    lagatGeneratedAmount?: number;
  };
  requestsByMonth?: Array<{ month: string; requests: number; amount: number; granted: number }>;
  purposeBreakdown?: Array<{
    purposeId: string;
    purposeName: string;
    requests: number;
    amount: number;
  }>;
  lagatByPaymentMode?: Array<{ paymentMode: string; count: number; amount: number }>;
};

function fmtInr(n: number | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n ?? 0));
}

type DashboardCardProps = {
  icon: ComponentType<SvgIconProps>;
  title: ReactNode;
  description: ReactNode;
  path: string;
};

const DashboardCard = ({ icon: Icon, title, description, path }: DashboardCardProps) => {
  const handleClick = () => {
    window.location.hash = `/${path}`;
    window.dispatchEvent(new Event("hashchange"));
  };

  return (
    <Card sx={{ minHeight: 150, width: "100%" }}>
      <CardActionArea onClick={handleClick} sx={{ height: "100%" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Icon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default function RazaDashboard() {
  const { permissions } = usePermissions();
  const theme = useTheme();
  const colors = useMemo(() => getChartColorSequence(theme), [theme]);
  const now = dayjs.utc();
  const defaultStartDate = now.startOf("month").format("YYYY-MM-DD");
  const defaultEndDate = now.endOf("month").format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RazaDashboardJson | null>(null);

  useEffect(() => {
    setLoading(true);
    void callApi({
      location: "razaRequests/dashboard/stats",
      method: "GET",
      data: { startDate, endDate },
    })
      .then(({ data }) => {
        setStats((data as RazaDashboardJson) ?? null);
      })
      .catch((error: unknown) => {
        console.error("Failed to load raza dashboard stats:", error);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const totals = stats?.totals ?? {};
  const purposePie = (stats?.purposeBreakdown ?? []).map((p) => ({
    name: p.purposeName,
    value: p.amount,
  }));
  const purposeBars = (stats?.purposeBreakdown ?? []).map((p) => ({
    purpose: p.purposeName.length > 18 ? `${p.purposeName.slice(0, 18)}…` : p.purposeName,
    fullPurpose: p.purposeName,
    lagatAmount: p.amount,
    requests: p.requests,
  }));
  const paymentModeBars = (stats?.lagatByPaymentMode ?? []).map((p) => ({
    mode: p.paymentMode,
    amount: p.amount,
    count: p.count,
  }));
  const monthBars = (stats?.requestsByMonth ?? []).map((m) => ({
    ...m,
    monthLabel: dayjs(`${m.month}-01`).format("MMM YY"),
  }));

  return (
    <>
      <Title title="Raza" />
      <DateRangeFilter
        defaultStartDate={defaultStartDate}
        defaultEndDate={defaultEndDate}
        onDateChange={(start, end) => {
          setStartDate(start || defaultStartDate);
          setEndDate(end || defaultEndDate);
        }}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Total requests
              </Typography>
              <Typography variant="h5">{totals.requests ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Raza granted
              </Typography>
              <Typography variant="h5">{totals.granted ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Raza pending
              </Typography>
              <Typography variant="h5">{totals.pending ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Lagat generated
              </Typography>
              <Typography variant="h6">{fmtInr(totals.lagatGeneratedAmount)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} mt={1}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 2, height: 360 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Requests and granted by month
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={monthBars}>
                  <XAxis dataKey="monthLabel" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requests" fill={colors[0]} name="Requests" />
                  <Bar dataKey="granted" fill={colors[1]} name="Granted" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 2, height: 360 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Lagat amount by purpose
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={purposePie} dataKey="value" nameKey="name" outerRadius={110} label>
                    {purposePie.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmtInr(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2, height: 360 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Raza and lagat by purpose
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={purposeBars}>
                  <XAxis dataKey="purpose" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Lagat amount") return fmtInr(Number(value));
                      return value;
                    }}
                    labelFormatter={(_, payload) => {
                      if (!payload || payload.length === 0) return "";
                      return String(payload[0].payload.fullPurpose ?? "");
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="lagatAmount" fill={colors[3]} name="Lagat amount" />
                  <Bar yAxisId="right" dataKey="requests" fill={colors[0]} name="Raza requests" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2, height: 320 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Lagat generated by payment mode
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={paymentModeBars}>
                  <XAxis dataKey="mode" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtInr(Number(v))} />
                  <Legend />
                  <Bar dataKey="amount" fill={colors[2]} name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} mt={3}>
        {RAZA_DASHBOARD_CARDS.filter((c) => hasPermission(permissions, c.permission)).map((c) => (
          <Grid
            key={c.path}
            size={{
              xs: 6,
              sm: 6,
              md: 4,
            }}
          >
            <DashboardCard
              icon={c.icon}
              title={c.label}
              description={c.description}
              path={c.path}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
