import React from "react";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

const styles = {
  grid: {
    marginTop: 2,
  },
};

function LoadingGridList({ grid }) {
  return (
    <>
      <Grid container spacing={1} alignItems="center" sx={styles.grid}>
        {[...Array(8).keys()].map((i) => (
          <Grid item lg={grid || 4} key={i}>
            <Skeleton variant="rectangular" width="100%" height={153} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default LoadingGridList;
