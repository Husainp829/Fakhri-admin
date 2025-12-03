import React from "react";

import Grid from "@mui/material/GridLegacy";
import Typography from "@mui/material/Typography";
import { Button, downloadCSV, usePermissions } from "react-admin";
import jsonExport from "jsonexport/dist";
import DownloadIcon from "@mui/icons-material/Download";

import LoadingGridList from "../../../components/LoadingWidget";

import MarkazStats from "./markazStats";
import ReceiptDayWise from "./receiptDayWise";
import { receiptGroupBy } from "../../../utils";

const LoadedGridList = ({ niyaazCounts, receiptReport, selectedMarkaz }) => {
  const { permissions } = usePermissions();
  const receiptMap = receiptGroupBy(receiptReport);

  const exporter = () => {
    const dailyReport = Object.entries(receiptMap?.[selectedMarkaz] || {}).map(([key, value]) => {
      const { CASH, CHEQUE, ONLINE } = value;
      return {
        DAY: key,
        CASH: CASH || 0,
        CHEQUE: CHEQUE || 0,
        ONLINE: ONLINE || 0,
      };
    });
    jsonExport(
      dailyReport,
      {
        headers: ["DAY", "CASH", "CHEQUE", "ONLINE"], // order fields in the export
      },
      (err, csv) => {
        downloadCSV(csv, "Daily Report"); // download as 'posts.csv` file
      }
    );
  };

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 3 }}>
        {permissions?.dashboard?.markaz && (
          <Grid item xs={12} sx={{ mb: 5 }}>
            <MarkazStats niyaazCounts={niyaazCounts} selectedMarkaz={selectedMarkaz} />
          </Grid>
        )}
        {permissions?.dashboard?.daywiseReceipt && (
          <>
            <Grid item xs={12} sx={{ mb: 5 }}>
              <Typography variant="h6" sx={{ mb: 0 }}>
                Day Wise Receipt Report
                <Button onClick={exporter}>
                  <DownloadIcon />
                </Button>
              </Typography>
            </Grid>
            <ReceiptDayWise receiptMap={receiptMap} selectedMarkaz={selectedMarkaz} />
          </>
        )}
      </Grid>
    </>
  );
};

const GridList = ({ isLoading, ...props }) =>
  isLoading ? <LoadingGridList /> : <LoadedGridList {...props} />;

export default GridList;
