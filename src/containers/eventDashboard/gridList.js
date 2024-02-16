/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useContext } from "react";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { receiptGroupBy } from "../../utils";
import LoadingGridList from "../../components/LoadingWidget";
import { EventContext } from "../../dataprovider/eventProvider";

import MarkazStats from "./markazStats";
import ReceiptDayWise from "./receiptDayWise";

const LoadedGridList = ({ niyaazCounts, receiptReport }) => (
  <>
    <Grid container spacing={1} sx={{ mt: 3 }}>
      <Grid item xs={12} sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Markaz Stats
        </Typography>
        <MarkazStats niyaazCounts={niyaazCounts} />
      </Grid>
      <Grid item xs={12} sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Day Wise Receipt Report
        </Typography>
      </Grid>
      <ReceiptDayWise receiptReport={receiptReport} />
    </Grid>
  </>
);

const GridList = ({ isLoading, ...props }) =>
  isLoading ? <LoadingGridList /> : <LoadedGridList {...props} />;

export default GridList;
