import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

const styles = {
  card: {
    padding: "15px 0",
    background: (theme) => theme.palette.primary.main,
  },
};

function CardGridWidget({ value, title, grid }) {
  return (
    <>
      <Grid item lg={grid || 3} xs={12}>
        <Card sx={styles.card}>
          <Typography variant="h3" align="center" color="white" sx={{ fontWeight: "bold", mb: 3 }}>
            {value}
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
