import React from "react";
import { Grid } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import CountCard from "../../../sabil/dashboard/components/CountCard";

const ActiveFmbCounts = ({ activeFmb }) => (
  <Grid container spacing={2}>
    <Grid item size={{ xs: 12, sm: 4 }}>
      <CountCard
        title="Thali active"
        value={activeFmb?.thaliActive ?? 0}
        icon={CheckCircleIcon}
        color="primary"
      />
    </Grid>
    <Grid item size={{ xs: 12, sm: 4 }}>
      <CountCard
        title="Thali inactive / unset"
        value={activeFmb?.thaliInactive ?? 0}
        icon={PauseCircleIcon}
        color="secondary"
      />
    </Grid>
    <Grid item size={{ xs: 12, sm: 4 }}>
      <CountCard
        title="Total active FMB"
        value={activeFmb?.total ?? 0}
        icon={GroupsIcon}
        color="success"
      />
    </Grid>
  </Grid>
);

export default ActiveFmbCounts;
