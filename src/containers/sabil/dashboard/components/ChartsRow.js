import React from "react";
import { Grid } from "@mui/material";
import FinancialOverviewChart from "./FinancialOverviewChart";
import SabilTypeChart from "./SabilTypeChart";

const ChartsRow = ({ financialData, sabilTypeData }) => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item size={{ xs: 12, md: 8 }}>
        <FinancialOverviewChart data={financialData} />
      </Grid>
      <Grid item size={{ xs: 12, md: 4 }}>
        <SabilTypeChart data={sabilTypeData} />
      </Grid>
    </Grid>
  );

export default ChartsRow;
