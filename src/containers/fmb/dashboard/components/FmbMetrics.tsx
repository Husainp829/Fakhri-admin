import Grid from "@mui/material/Grid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaymentIcon from "@mui/icons-material/Payment";
import PendingIcon from "@mui/icons-material/Pending";
import CategoryIcon from "@mui/icons-material/Category";
import WarningIcon from "@mui/icons-material/Warning";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import StatCard from "@/containers/sabil/dashboard/components/StatCard";

type TakhmeenRow = { amount?: unknown; count?: unknown };

type FmbDashboardStats = {
  takhmeenAmountCountsByType?: Record<string, TakhmeenRow[] | undefined>;
  paymentsReceived?: number;
  paymentsPending?: number;
  vendorPaymentVoucherTotal?: number;
  fmbNotPaid2Years?: { count?: number };
};

type FmbMetricsProps = {
  stats: FmbDashboardStats;
};

export default function FmbMetrics({ stats }: FmbMetricsProps) {
  const byType = stats?.takhmeenAmountCountsByType || {};
  const sumType = (key: string) =>
    (byType[key] || []).reduce(
      (sum, row) => sum + Number(row.amount || 0) * Number(row.count || 0),
      0
    );
  const annualCommitted = sumType("ANNUAL");
  const voluntaryCommitted = sumType("VOLUNTARY");
  const zabihatCommitted = sumType("ZABIHAT");
  const contributionCommitted = voluntaryCommitted + zabihatCommitted;
  const vendorOut = stats.vendorPaymentVoucherTotal || 0;
  const netAfterVendor = (stats.paymentsReceived || 0) - vendorOut;
  const netColor = netAfterVendor >= 0 ? ("success" as const) : ("error" as const);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 3,
        }}
      >
        <StatCard
          title="Annual (period)"
          value={annualCommitted}
          icon={TrendingUpIcon}
          color="primary"
          subtitle="Annual commitment total for selected Hijri period"
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
          title="Contributions"
          value={contributionCommitted}
          icon={CategoryIcon}
          color="warning"
          subtitle="Zabihat + voluntary commitments in this period"
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
          title="Zabihat only"
          value={zabihatCommitted}
          icon={CategoryIcon}
          color="warning"
          subtitle="Zabihat contribution amount for this period"
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
          title="Income (receipts)"
          value={stats.paymentsReceived || 0}
          icon={PaymentIcon}
          color="success"
          subtitle="Payments posted to annual + contribution targets"
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
          title="Vendor expenses"
          value={vendorOut}
          icon={ReceiptLongIcon}
          color="secondary"
          subtitle="Payment vouchers for this Hijri period"
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
          title="Net after vendor payouts"
          value={netAfterVendor}
          icon={AccountBalanceIcon}
          color={netColor}
          subtitle="Receipts minus vendor vouchers (same period)"
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
          title="Pending balance"
          value={stats.paymentsPending || 0}
          icon={PendingIcon}
          color="error"
          subtitle="Outstanding for annual + contribution targets"
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
          title="Not paid 2+ years"
          value={String(stats.fmbNotPaid2Years?.count ?? 0)}
          icon={WarningIcon}
          color="error"
          subtitle="No payment or last paid over 2 years ago"
        />
      </Grid>
    </Grid>
  );
}
