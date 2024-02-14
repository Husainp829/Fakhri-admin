import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { Chart } from "react-google-charts";

const styles = {
  card: {
    padding: "15px 0",
    background: (theme) => theme.palette.primary.main,
  },
};

function CardGridChart({ values, label }) {
  const options = {
    // legend: "none",
    backgroundColor: "#0a1f31",
    legendTextStyle: { color: "#FFF", fontFamily: "Quantico" },
    pieSliceText: "label",
  };

  const data = [["vertical", "count"]];
  values?.map((v) => {
    if (v.vertical) {
      data.push([v.vertical, parseInt(v.count, 10)]);
    }
    return null;
  });

  return (
    <>
      <Grid item lg={6} xs={12}>
        <Card sx={styles.card}>
          <Chart chartType="Bar" data={data} options={options} width="100%" height="360px" />
          <Typography variant="body1" gutterBottom align="center" color="white">
            {label}
          </Typography>
        </Card>
      </Grid>
    </>
  );
}

export default CardGridChart;
