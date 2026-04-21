import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Title, useCreatePath, usePermissions, useRedirect } from "react-admin";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Link as MuiLink,
  Stack,
  Typography,
  CircularProgress,
  Divider,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { fromGregorian } from "@/utils/hijri-date-utils";
import { formatMajlisStartTimeLabel } from "@/containers/ohbat/ohbat-majlis/OhbatMajlisTime";
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

const formatMajlisDateUtc = (date: unknown) =>
  date ? dayjs.utc(String(date)).format("DD - MMM - YYYY") : "—";

const formatMajlisDayOfWeekUtc = (date: unknown) =>
  date ? dayjs.utc(String(date)).format("dddd") : "—";

const formatMajlisHijriUtc = (date: unknown) =>
  date ? fromGregorian(dayjs.utc(String(date)).toDate(), "code") : "—";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  onNavigate?: () => void;
};

const statCardContentSx = {
  p: { xs: 1.25, sm: 2 },
  "&:last-child": { pb: { xs: 1.25, sm: 2 } },
};

function StatCard({ title, value, subtitle, color = "primary.main", onNavigate }: StatCardProps) {
  const body = (
    <>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        gutterBottom
        sx={{ typography: { xs: "caption", sm: "subtitle2" }, lineHeight: 1.35 }}
      >
        {title}
      </Typography>
      <Typography variant="h5" sx={{ color, typography: { xs: "h6", sm: "h5" } }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mt: 0.5, fontSize: { xs: "0.65rem", sm: undefined } }}
        >
          {subtitle}
        </Typography>
      )}
    </>
  );

  if (onNavigate) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardActionArea onClick={onNavigate} sx={{ height: "100%", textAlign: "left" }}>
          <CardContent sx={statCardContentSx}>{body}</CardContent>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={statCardContentSx}>{body}</CardContent>
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

type AttendanceBySectorRow = { sector: string; count: number };
type MajlisByTypeRow = { type: string; count: number };

type OhbatDashboardStats = {
  asOf?: string;
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

type NextMajlisRow = {
  id?: string;
  date?: unknown;
  type?: string | null;
  startTime?: string | null;
  hostName?: string | null;
  hostItsNo?: string | null;
  mobileNo?: string | null;
  hostSector?: string | null;
  hostSubSector?: string | null;
  sadarat?: { name?: string } | null;
  khidmatguzar?: { Full_Name?: string } | null;
  khidmatguzarItsNo?: string | null;
  zakereen?: { Full_Name?: string } | null;
  zakereenItsNo?: string | null;
};

function isNextMajlisRow(row: unknown): row is NextMajlisRow {
  return (
    typeof row === "object" && row !== null && "id" in row && (row as NextMajlisRow).id != null
  );
}

export default function OhbatDashboard() {
  const theme = useTheme();
  const chartColors = useMemo(() => getChartColorSequence(theme), [theme]);
  const redirect = useRedirect();
  const createPath = useCreatePath();
  const { permissions } = usePermissions();
  const [stats, setStats] = useState<OhbatDashboardStats | null>(null);
  const [nextMajlis, setNextMajlis] = useState<NextMajlisRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingError, setUpcomingError] = useState<string | null>(null);

  const can = (p: string) => hasPermission(permissions, p);
  const canAny = (list: string[]) => hasAnyPermission(permissions, list);
  const canLoadStats = canAny(["ohbatMajalis.view", "ohbatMajlisAttendance.view"]);
  const attendanceCreateBase = createPath({ resource: "ohbatMajlisAttendance", type: "create" });
  const toAttendanceCreate = (majlisId: string) =>
    `${attendanceCreateBase}?ohbatMajalisId=${encodeURIComponent(majlisId)}`;

  const loadDashboard = useCallback(async () => {
    if (!canLoadStats) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setUpcomingError(null);
    try {
      const [statsResult, upcomingResult] = await Promise.allSettled([
        callApi({
          location: "ohbatMajalis",
          method: "GET",
          id: "stats/dashboard",
        }),
        callApi({
          location: "ohbatMajalis",
          method: "GET",
          id: "attendance/upcoming",
        }),
      ]);

      if (statsResult.status === "fulfilled") {
        const raw = statsResult.value?.data;
        setStats(isOhbatDashboardStats(raw) ? raw : null);
      } else {
        setStats(null);
        setError(
          statsResult.reason instanceof Error
            ? statsResult.reason.message
            : "Failed to load dashboard stats"
        );
      }

      if (upcomingResult.status === "fulfilled") {
        const body = upcomingResult.value?.data as { rows?: unknown[] } | undefined;
        const first = body?.rows?.[0];
        setNextMajlis(isNextMajlisRow(first) ? first : null);
      } else {
        setNextMajlis(null);
        setUpcomingError(
          upcomingResult.reason instanceof Error
            ? upcomingResult.reason.message
            : "Failed to load upcoming majlis"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [canLoadStats]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

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

  const nextMajlisMeta = nextMajlis
    ? [
        nextMajlis.sadarat?.name ? `Sadarat: ${nextMajlis.sadarat.name}` : null,
        nextMajlis.khidmatguzar?.Full_Name || nextMajlis.khidmatguzarItsNo
          ? `Khidmat: ${nextMajlis.khidmatguzar?.Full_Name || String(nextMajlis.khidmatguzarItsNo)}`
          : null,
        nextMajlis.zakereen?.Full_Name || nextMajlis.zakereenItsNo
          ? `Zakereen: ${nextMajlis.zakereen?.Full_Name || String(nextMajlis.zakereenItsNo)}`
          : null,
        nextMajlis.mobileNo ? `Contact: ${String(nextMajlis.mobileNo)}` : null,
        [nextMajlis.hostSector, nextMajlis.hostSubSector].filter(Boolean).join(" · ") || null,
        nextMajlis.date ? `Day: ${formatMajlisDayOfWeekUtc(nextMajlis.date)}` : null,
        nextMajlis.date ? `Hijri: ${formatMajlisHijriUtc(nextMajlis.date)}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  const asOfLabel =
    stats?.asOf != null && stats.asOf !== ""
      ? `Figures as of start of day (UTC): ${dayjs.utc(String(stats.asOf)).format("DD MMM YYYY")}`
      : null;

  return (
    <>
      <Title title="Ohbat" />
      <Box
        sx={{
          mt: 1,
          mb: 2,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h6">Ohbat majlis overview</Typography>
          {asOfLabel && (
            <Typography variant="caption" color="text.secondary" display="block">
              {asOfLabel}
            </Typography>
          )}
        </Box>
        {can("ohbatMajalis.create") && (
          <Button
            variant="contained"
            component={Link}
            to={createPath({ resource: "ohbatMajalis", type: "create" })}
          >
            Schedule majlis
          </Button>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        Quick links
      </Typography>
      <Box
        component="nav"
        aria-label="Quick links"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: 0.75,
          rowGap: 0.25,
          mb: 2,
        }}
      >
        {linkCards.map((c, i) => (
          <Fragment key={c.to}>
            {i > 0 ? (
              <Typography
                component="span"
                variant="caption"
                color="text.disabled"
                aria-hidden
                sx={{ userSelect: "none" }}
              >
                ·
              </Typography>
            ) : null}
            <MuiLink
              component={Link}
              to={c.to}
              variant="body2"
              underline="hover"
              title={c.description}
              sx={{ fontWeight: 500, lineHeight: 1.4 }}
            >
              {c.title}
            </MuiLink>
          </Fragment>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

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
          {!loading && upcomingError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {upcomingError}
            </Typography>
          )}
          {!loading && !upcomingError && (
            <Card variant="outlined" sx={{ mb: 3, borderColor: "primary.main", borderWidth: 1 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Next upcoming majlis
                </Typography>
                {nextMajlis?.id ? (
                  <>
                    <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
                      {(nextMajlis.hostName as string) || nextMajlis.hostItsNo || "—"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {formatMajlisDateUtc(nextMajlis.date)} ·{" "}
                      {nextMajlis.type ? typeDisplayName(String(nextMajlis.type)) : "—"} ·{" "}
                      {formatMajlisStartTimeLabel(nextMajlis.startTime)}
                    </Typography>
                    {nextMajlisMeta ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {nextMajlisMeta}
                      </Typography>
                    ) : null}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                      {can("ohbatMajlisAttendance.create") && (
                        <Button
                          variant="contained"
                          component={Link}
                          to={toAttendanceCreate(String(nextMajlis.id))}
                        >
                          Record attendance
                        </Button>
                      )}
                      {can("ohbatMajalis.view") && (
                        <Button
                          variant="outlined"
                          onClick={() => redirect("show", "ohbatMajalis", nextMajlis.id)}
                        >
                          View majlis
                        </Button>
                      )}
                      {canAny(["ohbatMajalis.view", "ohbatMajlisAttendance.view"]) && (
                        <Button variant="text" component={Link} to="/ohbatMajlisUpcoming">
                          All upcoming
                        </Button>
                      )}
                    </Stack>
                  </>
                ) : (
                  <Typography color="text.secondary">No upcoming majlis scheduled.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          {!loading && stats && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid
                  size={{
                    xs: 6,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Majlis completed (past)"
                    value={fmt(stats.majlis?.completed)}
                    subtitle="Before today (UTC)"
                    color="success.main"
                    {...(can("ohbatMajalis.view")
                      ? { onNavigate: () => redirect("/ohbatMajalis") }
                      : {})}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 6,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Upcoming majlis"
                    value={fmt(stats.majlis?.upcoming)}
                    subtitle="Today and later"
                    color="primary.main"
                    {...(canAny(["ohbatMajalis.view", "ohbatMajlisAttendance.view"])
                      ? { onNavigate: () => redirect("/ohbatMajlisUpcoming") }
                      : {})}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 6,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Attendance records"
                    value={fmt(stats.attendance?.totalRecords)}
                    subtitle={`${fmt(stats.attendance?.distinctAttendees)} unique ITS`}
                    color="secondary.main"
                    {...(can("ohbatMajlisAttendance.view")
                      ? { onNavigate: () => redirect("/ohbatMajlisAttendance") }
                      : {})}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 6,
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
                    xs: 6,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Makhsoos marks"
                    value={fmt(stats.makhsoosMarksCount)}
                    subtitle="ITS marked makhsoos"
                    {...(can("makhsoosItsData.view")
                      ? { onNavigate: () => redirect("/makhsoosItsData") }
                      : {})}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 6,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Sadarats"
                    value={fmt(stats.sadaratsCount)}
                    subtitle="Active records"
                    {...(can("sadarats.view") ? { onNavigate: () => redirect("/sadarats") } : {})}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 6,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <StatCard
                    title="Total majlis"
                    value={fmt(stats.majlis?.total)}
                    subtitle="All scheduled"
                    {...(can("ohbatMajalis.view")
                      ? { onNavigate: () => redirect("/ohbatMajalis") }
                      : {})}
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
    </>
  );
}
