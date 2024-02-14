import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

const styles = {
  card: {
    padding: "20px 0",
    background: (theme) => theme.palette.primary.main,
  },
};

function CardGridWidget({ value, title, grid, showCurr }) {
  const val = Intl.NumberFormat("en-IN").format(value);
  return (
    <>
      <Grid item lg={grid || 3} xs={12}>
        <Card sx={styles.card}>
          <Typography variant="h4" align="center" color="white" sx={{ fontWeight: "bold", mb: 2 }}>
            {showCurr ? "₹" : ""} {val}
          </Typography>
          <Typography variant="body1" gutterBottom align="center" color="white">
            {title}
          </Typography>
        </Card>
      </Grid>
    </>
  );
}

export default CardGridWidget;
