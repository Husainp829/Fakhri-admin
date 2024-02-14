/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useContext } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { calcTotalPayable, groupBy } from "../../utils";
import CardGridWidget from "../../components/CardWidget";
import LoadingGridList from "../../components/LoadingWidget";
import { EventContext } from "../../dataprovider/eventProvider";

const styles = {
  grid: {
    marginTop: 2,
    marginBottom: 5,
  },
};

const LoadedGridList = ({ niyaazCounts }) => {
  const niyaazMap = groupBy("markaz")(niyaazCounts);
  const { currentEvent } = useContext(EventContext);

  return (
    <>
      {Object.keys(niyaazMap).map((markaz) => {
        const stat = niyaazMap[markaz][0] || {};
        return (
          <Grid container spacing={1} alignItems="center" sx={styles.grid} key={markaz}>
            <Grid item xs={12}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                {markaz}
              </Typography>
            </Grid>
            <CardGridWidget value={stat.takhmeenAmount} showCurr title="Takhmeen Amount" />
            <CardGridWidget value={stat.chairs} title="Chairs" />
            <CardGridWidget value={stat.iftaari} showCurr title="Iftaari" />
            <CardGridWidget value={stat.zabihat} title="Zabihat" />
            <CardGridWidget
              value={`₹ ${calcTotalPayable(currentEvent, stat)}`}
              title="Total Payable"
              grid={4}
            />
            <CardGridWidget value={stat.paidAmount} showCurr title="Total Paid" grid={4} />
            <CardGridWidget
              value={calcTotalPayable(currentEvent, stat) - parseInt(stat.paidAmount, 10)}
              title="Total Balance"
              showCurr
              grid={4}
            />
          </Grid>
        );
      })}
    </>
  );
};

const GridList = ({ isLoading, ...props }) =>
  isLoading ? <LoadingGridList /> : <LoadedGridList {...props} />;

export default GridList;
