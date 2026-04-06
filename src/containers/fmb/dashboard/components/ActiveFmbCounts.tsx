import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import CountCard from "@/containers/sabil/dashboard/components/CountCard";

type ActiveFmb = {
  activeThalis?: number;
  inactiveThalis?: number;
  total?: number;
};

type ActiveFmbCountsProps = {
  activeFmb?: ActiveFmb | null;
};

export default function ActiveFmbCounts({ activeFmb }: ActiveFmbCountsProps) {
  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <CountCard
          title="Active thalis"
          value={activeFmb?.activeThalis ?? 0}
          icon={CheckCircleIcon}
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
          title="Inactive thalis"
          value={activeFmb?.inactiveThalis ?? 0}
          icon={PauseCircleIcon}
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
          title="Total active FMB"
          value={activeFmb?.total ?? 0}
          icon={GroupsIcon}
          color="success"
        />
      </Grid>
    </Grid>
  );
}
