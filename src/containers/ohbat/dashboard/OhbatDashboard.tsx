import { useCallback, useEffect, useMemo, useState } from "react";
import { Title, usePermissions, useRedirect } from "react-admin";
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  CircularProgress,
  Divider,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
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
import { callApi } from "@/dataprovider/misc-apis";
import { hasAnyPermission, hasPermission } from "@/utils/permission-utils";
import { getChartColorSequence } from "@/theme/chartPalette";

function fmt(n: unknown): string {
  if (n === null || n === undefined) return "0";
  return Number(n).toLocaleString();
}

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
};

function StatCard({ title, value, subtitle, color = "primary.main" }: StatCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ color }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function typeDisplayName(type: string): string {
  const m: Record<string, string> = {
    Jaman: "Jaman",
    Food_packets: "Food packets",
    Salawaat: "Salawaat",
  };
  return m[type] || type;
}

type LinkCardProps = {
  title: string;
  description: string;
  to: string;
  navigate: ReturnType<typeof useRedirect>;
};

const LinkCard = ({ title, description, to, navigate }: LinkCardProps) => (
  <Card sx={{ minHeight: 112, width: "100%" }}>
    <CardActionArea onClick={() => navigate(to)} sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

type AttendanceBySectorRow = { sector: string; count: number };
type MajlisByTypeRow = { type: string; count: number };

type OhbatDashboardStats = {
  majlis?: {
    completed?: number;
    upcoming?: number;
    total?: number;
  };
  attendance?: {
    totalRecords?: number;
    distinctAttendees?: number;
    avgPerCompletedMajlis?: number;
  };
  attendanceBySector?: AttendanceBySectorRow[];
  majlisCompletedByType?: MajlisByTypeRow[];
  makhsoosMarksCount?: number;
  sadaratsCount?: number;
};

function isOhbatDashboardStats(data: unknown): data is OhbatDashboardStats {
  return typeof data === "object" && data !== null;
}

export default function OhbatDashboard() {
  const theme = useTheme();
  const chartColors = useMemo(() => getChartColorSequence(theme), [theme]);
  const redirect = useRedirect();
  const { permissions } = usePermissions();
  const [stats, setStats] = useState<OhbatDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const can = (p: string) => hasPermission(permissions, p);
  const canAny = (list: string[]) => hasAnyPermission(permissions, list);
  const canLoadStats = canAny(["ohbatMajalis.view", "ohbatMajlisAttendance.view"]);

  const loadStats = useCallback(async () => {
    if (!canLoadStats) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await callApi({
        location: "ohbatMajalis",
        method: "GET",
        id: "stats/dashboard",
      });
      const raw = resp?.data;
      setStats(isOhbatDashboardStats(raw) ? raw : null);
    } catch (e: unknown) {
      setStats(null);
      setError(e instanceof Error ? e.message : "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }, [canLoadStats]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const sectorChartData = useMemo(() => {
    const rows = stats?.attendanceBySector || [];
    if (rows.length === 0) return [];
    const mapped = rows.map((r) => ({
      name: r.sector.length > 22 ? `${r.sector.slice(0, 20)}…` : r.sector,
      fullName: r.sector,
      count: r.count,
    }));
    if (mapped.length <= 12) return mapped;
    const top = mapped.slice(0, 11);
    const otherCount = mapped.slice(11).reduce((s, r) => s + r.count, 0);
    return [...top, { name: "Other", fullName: "Other sectors", count: otherCount }];
  }, [stats]);

  const typePieData = useMemo(
    () =>
      (stats?.majlisCompletedByType || []).map((r) => ({
        name: typeDisplayName(r.type),
        value: r.count,
      })),
    [stats]
  );

  const linkCards: { title: string; description: string; to: string }[] = [];
  if (can("ohbatMajalis.view")) {
    linkCards.push({
      title: "Ohbat majlis",
      description: "Calendar, create and edit majlis",
      to: "/ohbatMajalis",
    });
  }
  if (canAny(["ohbatMajalis.view", "ohbatMajlisAttendance.view"])) {
    linkCards.push({
      title: "Upcoming majlis",
      description: "Future majlis and quick attendance",
      to: "/ohbatMajlisUpcoming",
    });
  }
  if (can("sadarats.view")) {
    linkCards.push({
      title: "Sadarats",
      description: "Sadarat master",
      to: "/sadarats",
    });
  }
  if (can("makhsoosItsData.view")) {
    linkCards.push({
      title: "Makhsoos ITS",
      description: "Marks for sector matching",
      to: "/makhsoosItsData",
    });
  }
  if (can("ohbatMajlisAttendance.view")) {
    linkCards.push({
      title: "Attendance log",
      description: "All recorded attendance",
      to: "/ohbatMajlisAttendance",
    });
  }

  return (
    <>
      <Title title="Ohbat" />
      <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
        Ohbat majlis overview
      </Typography>
      {canLoadStats && (
        <>
          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
          {!loading && error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          {!loading && stats && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Majlis completed (past)"
                    value={fmt(stats.majlis?.completed)}
                    subtitle="Before today (UTC)"
                    color="success.main"
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Upcoming majlis"
                    value={fmt(stats.majlis?.upcoming)}
                    subtitle="Today and later"
                    color="primary.main"
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Attendance records"
                    value={fmt(stats.attendance?.totalRecords)}
                    subtitle={`${fmt(stats.attendance?.distinctAttendees)} unique ITS`}
                    color="secondary.main"
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Avg records / completed majlis"
                    value={fmt(stats.attendance?.avgPerCompletedMajlis)}
                    subtitle="All-time ratio"
                    color="text.primary"
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Makhsoos marks"
                    value={fmt(stats.makhsoosMarksCount)}
                    subtitle="ITS marked makhsoos"
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Sadarats"
                    value={fmt(stats.sadaratsCount)}
                    subtitle="Active records"
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Total majlis"
                    value={fmt(stats.majlis?.total)}
                    subtitle="All scheduled"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid
                  size={{
                    xs: 12,
                    md: 7,
                  }}
                >
                  <Card sx={{ p: 2, height: 380 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Attendance by sector (ITS)
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 1 }}
                    >
                      From itsdata match on attendee ITS; unknown if not in itsdata
                    </Typography>
                    {sectorChartData.length === 0 ? (
                      <Typography color="text.secondary" sx={{ py: 4 }} align="center">
                        No attendance yet
                      </Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={sectorChartData}
                          margin={{ top: 8, right: 16, left: 0, bottom: 64 }}
                        >
                          <XAxis
                            dataKey="name"
                            interval={0}
                            angle={-28}
                            textAnchor="end"
                            height={70}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis allowDecimals={false} />
                          <Tooltip
                            formatter={(value) => [fmt(value), "Attendance"]}
                            labelFormatter={(_, payload) => {
                              const row = (
                                payload as unknown as { payload?: { fullName?: string } }[]
                              )?.[0]?.payload;
                              return String(row?.fullName ?? "");
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill={theme.palette.primary.main}
                            name="Count"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Card>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    md: 5,
                  }}
                >
                  <Card sx={{ p: 2, height: 380 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Completed majlis by type
                    </Typography>
                    {typePieData.length === 0 ? (
                      <Typography color="text.secondary" sx={{ py: 4 }} align="center">
                        No completed majlis yet
                      </Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={typePieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={false}
                          >
                            {typePieData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={chartColors[index % chartColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => fmt(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>
        Quick links
      </Typography>
      <Grid container spacing={2}>
        {linkCards.map((c) => (
          <Grid
            key={c.to}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <LinkCard {...c} navigate={redirect} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
