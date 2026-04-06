import Grid from "@mui/material/Grid";
import FinancialOverviewChart from "@/containers/sabil/dashboard/components/FinancialOverviewChart";
import type { ChartDatum } from "@/containers/sabil/dashboard/components/ChartsRow";
import DeliveryProfileChart from "./DeliveryProfileChart";

type FmbChartsRowProps = {
  financialData: ChartDatum[];
  deliveryProfileData: { name?: string; value?: number; color?: string }[];
};

export default function FmbChartsRow({ financialData, deliveryProfileData }: FmbChartsRowProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid
        size={{
          xs: 12,
          md: 8,
        }}
      >
        <FinancialOverviewChart data={financialData} />
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 4,
        }}
      >
        <DeliveryProfileChart data={deliveryProfileData} />
      </Grid>
    </Grid>
  );
}
