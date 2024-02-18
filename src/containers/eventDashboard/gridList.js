/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useContext } from "react";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { usePermissions } from "react-admin";

import { receiptGroupBy } from "../../utils";
import LoadingGridList from "../../components/LoadingWidget";
import { EventContext } from "../../dataprovider/eventProvider";

import MarkazStats from "./markazStats";
import ReceiptDayWise from "./receiptDayWise";

const LoadedGridList = ({ niyaazCounts, receiptReport, selectedMarkaz }) => {
  const { permissions } = usePermissions();
  return (
    <>
      <Grid container spacing={1} sx={{ mt: 3 }}>
        {permissions?.dashboard?.markaz && (
          <Grid item xs={12} sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Markaz Stats
            </Typography>
            <MarkazStats niyaazCounts={niyaazCounts} selectedMarkaz={selectedMarkaz} />
          </Grid>
        )}
        {permissions?.dashboard?.daywiseReceipt && (
          <>
            <Grid item xs={12} sx={{ mb: 5 }}>
              <Typography variant="h5" sx={{ mb: 0 }}>
                Day Wise Receipt Report
              </Typography>
            </Grid>
            <ReceiptDayWise receiptReport={receiptReport} selectedMarkaz={selectedMarkaz} />
          </>
        )}
      </Grid>
    </>
  );
};

const GridList = ({ isLoading, ...props }) =>
  isLoading ? <LoadingGridList /> : <LoadedGridList {...props} />;

export default GridList;
