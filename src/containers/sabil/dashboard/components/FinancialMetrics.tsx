import Grid from "@mui/material/Grid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaymentIcon from "@mui/icons-material/Payment";
import PendingIcon from "@mui/icons-material/Pending";
import WarningIcon from "@mui/icons-material/Warning";
import CancelIcon from "@mui/icons-material/Cancel";
import StatCard from "./StatCard";

export type DashboardStatsShape = {
  sabilForecast?: number;
  paymentsReceived?: number;
  paymentsPending?: number;
  writeoffAmount?: number;
  sabilsNotPaid2Years?: { count?: number };
};

type FinancialMetricsProps = {
  stats: DashboardStatsShape;
  onViewNotPaidSabils?: () => void;
};

const FinancialMetrics = ({ stats, onViewNotPaidSabils }: FinancialMetricsProps) => (
  <Grid container spacing={3} sx={{ mb: 3 }}>
    <Grid
      size={{
        xs: 12,
        sm: 6,
        md: 2,
      }}
    >
      <StatCard
        title="Sabil Forecast"
        value={stats.sabilForecast || 0}
        icon={TrendingUpIcon}
        color="primary"
        subtitle="Total expected for FY"
      />
    </Grid>
    <Grid
      size={{
        xs: 12,
        sm: 6,
        md: 2,
      }}
    >
      <StatCard
        title="Payments Received"
        value={stats.paymentsReceived || 0}
        icon={PaymentIcon}
        color="success"
        subtitle="Total collected"
      />
    </Grid>
    <Grid
      size={{
        xs: 12,
        sm: 6,
        md: 2,
      }}
    >
      <StatCard
        title="Payments Pending"
        value={stats.paymentsPending || 0}
        icon={PendingIcon}
        color="error"
        subtitle="Outstanding amount"
      />
    </Grid>
    <Grid
      size={{
        xs: 12,
        sm: 6,
        md: 2,
      }}
    >
      <StatCard
        title="Written Off"
        value={stats.writeoffAmount || 0}
        icon={CancelIcon}
        color="warning"
        subtitle="Total written off"
      />
    </Grid>
    <Grid
      size={{
        xs: 12,
        sm: 6,
        md: 4,
      }}
    >
      <StatCard
        title="Not Paid 2+ Years"
        value={stats.sabilsNotPaid2Years?.count || 0}
        icon={WarningIcon}
        color="error"
        subtitle="Sabils overdue"
        valueType="count"
        onClick={onViewNotPaidSabils}
      />
    </Grid>
  </Grid>
);

export default FinancialMetrics;
