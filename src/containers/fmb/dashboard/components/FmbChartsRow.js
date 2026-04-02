import React from "react";
import { Grid } from "@mui/material";
import FinancialOverviewChart from "../../../sabil/dashboard/components/FinancialOverviewChart";
import DeliveryProfileChart from "./DeliveryProfileChart";

const FmbChartsRow = ({ financialData, deliveryProfileData }) => (
  <Grid container spacing={3} sx={{ mb: 3 }}>
    <Grid item size={{ xs: 12, md: 8 }}>
      <FinancialOverviewChart data={financialData} />
    </Grid>
    <Grid item size={{ xs: 12, md: 4 }}>
      <DeliveryProfileChart data={deliveryProfileData} />
    </Grid>
  </Grid>
);

export default FmbChartsRow;
