import React from "react";
import Grid from "@mui/material/Grid";
import { groupBy } from "../../utils";
import CardGridWidget from "../../components/CardWidget";
import CardGridChart from "../../components/ChartWidget";
import LoadingGridList from "../../components/LoadingWidget";

const styles = {
  grid: {
    marginTop: 2,
  },
};

const LoadedGridList = ({ udf, registrations, speakers, statusList }) => {
  const registrationsMap = groupBy("status")(registrations);
  return (
    <>
      <Grid container spacing={1} alignItems="center" sx={styles.grid}>
        {statusList.map((r, i) => {
          let obj = {};
          if (r.pass) {
            obj = registrationsMap[r.pass]?.[0] || [{}];
            return <CardGridWidget value={obj?.count || 0} key={i} title={r.pass || ""} />;
          }
          obj = registrationsMap[r.id]?.[0] || {};
          return <CardGridWidget value={obj?.count || 0} key={i} title={r.id || ""} />;
        })}

        <CardGridWidget value={speakers} title="SPEAKERS" />
        {udf?.map((u) => (
          <CardGridChart key={u.name} {...u} />
        ))}
      </Grid>
    </>
  );
};

const GridList = ({ isLoading, ...props }) =>
  isLoading ? <LoadingGridList /> : <LoadedGridList {...props} />;

export default GridList;
