import React from "react";
import { Grid } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaymentIcon from "@mui/icons-material/Payment";
import PendingIcon from "@mui/icons-material/Pending";
import CategoryIcon from "@mui/icons-material/Category";
import WarningIcon from "@mui/icons-material/Warning";
import StatCard from "../../../sabil/dashboard/components/StatCard";

const FmbMetrics = ({ stats }) => (
  <Grid container spacing={3} sx={{ mb: 3 }}>
    <Grid item size={{ xs: 12, sm: 6, md: 2.4 }}>
      <StatCard
        title="Takhmeen (period)"
        value={stats.fmbForecast || 0}
        icon={TrendingUpIcon}
        color="primary"
        subtitle="Sum of takhmeen lines for selected Hijri period"
      />
    </Grid>
    <Grid item size={{ xs: 12, sm: 6, md: 2.4 }}>
      <StatCard
        title="Receipts (period)"
        value={stats.paymentsReceived || 0}
        icon={PaymentIcon}
        color="success"
        subtitle="Payments posted to this period’s takhmeen"
      />
    </Grid>
    <Grid item size={{ xs: 12, sm: 6, md: 2.4 }}>
      <StatCard
        title="Pending balance"
        value={stats.paymentsPending || 0}
        icon={PendingIcon}
        color="error"
        subtitle="Outstanding on this period’s takhmeen"
      />
    </Grid>
    <Grid item size={{ xs: 12, sm: 6, md: 2.4 }}>
      <StatCard
        title="Zabihat takhmeen"
        value={stats.zabihatForecast || 0}
        icon={CategoryIcon}
        color="warning"
        subtitle="Zabihat amount total for this period"
      />
    </Grid>
    <Grid item size={{ xs: 12, sm: 6, md: 2.4 }}>
      <StatCard
        title="Not paid 2+ years"
        value={String(stats.fmbNotPaid2Years?.count ?? 0)}
        icon={WarningIcon}
        color="error"
        subtitle="No payment or last paid over 2 years ago"
      />
    </Grid>
  </Grid>
);

export default FmbMetrics;
