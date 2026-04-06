import Grid from "@mui/material/Grid";
import HomeIcon from "@mui/icons-material/Home";
import BusinessIcon from "@mui/icons-material/Business";
import CountCard from "./CountCard";

type ActiveSabils = {
  chula?: number;
  establishment?: number;
  total?: number;
};

type ActiveSabilsCountProps = {
  activeSabils?: ActiveSabils;
};

const ActiveSabilsCount = ({ activeSabils }: ActiveSabilsCountProps) => (
  <Grid container spacing={2}>
    <Grid
      size={{
        xs: 12,
        sm: 4,
      }}
    >
      <CountCard
        title="Active Chula"
        value={activeSabils?.chula || 0}
        icon={HomeIcon}
        color="primary"
      />
    </Grid>
    <Grid
      size={{
        xs: 12,
        sm: 4,
      }}
    >
      <CountCard
        title="Active Est"
        value={activeSabils?.establishment || 0}
        icon={BusinessIcon}
        color="secondary"
      />
    </Grid>
    <Grid
      size={{
        xs: 12,
        sm: 4,
      }}
    >
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
