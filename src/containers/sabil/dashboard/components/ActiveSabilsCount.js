import React from "react";
import { Grid } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import CountCard from "./CountCard";

const ActiveSabilsCount = ({ activeSabils }) => (
    <Grid container spacing={2}>
      <Grid item size={{ xs: 12, sm: 4 }}>
        <CountCard
          title="Active Chula"
          value={activeSabils?.chula || 0}
          icon={HomeIcon}
          color="primary"
        />
      </Grid>
      <Grid item size={{ xs: 12, sm: 4 }}>
        <CountCard
          title="Active Est"
          value={activeSabils?.establishment || 0}
          icon={BusinessIcon}
          color="secondary"
        />
      </Grid>
      <Grid item size={{ xs: 12, sm: 4 }}>
        <CountCard
          title="Total Active"
          value={activeSabils?.total || 0}
          icon={HomeIcon}
          color="success"
        />
      </Grid>
    </Grid>
  );

export default ActiveSabilsCount;
