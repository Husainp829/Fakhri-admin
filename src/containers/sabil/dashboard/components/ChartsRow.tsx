import Grid from "@mui/material/Grid";
import FinancialOverviewChart from "./FinancialOverviewChart";
import SabilTypeChart from "./SabilTypeChart";

export type ChartDatum = { name: string; value: number; color: string };

type ChartsRowProps = {
  financialData: ChartDatum[];
  sabilTypeData: ChartDatum[];
};

const ChartsRow = ({ financialData, sabilTypeData }: ChartsRowProps) => (
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
      <SabilTypeChart data={sabilTypeData} />
    </Grid>
  </Grid>
);

export default ChartsRow;
