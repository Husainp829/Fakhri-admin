import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import { useStore } from "react-admin";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import dayjs from "dayjs";
import { navigateToBaseRoute } from "@/utils/route-utility";
import type { CurrentEvent, EventsListRecord } from "@/containers/events/types";

const styles = {
  grid: {
    marginTop: "0px",
  },
  tile: {
    maxHeight: "350px",
  },
  card: {},
};

const LoadingGridList = () => (
  <Grid container spacing={2} alignItems="center" sx={styles.grid}>
    {[...Array(8).keys()].map((i) => (
      <Grid
        key={i}
        size={{
          lg: 3,
        }}
      >
        <Skeleton variant="rectangular" width="100%" height={310} />
      </Grid>
    ))}
  </Grid>
);

const editEvent = (id: string | number) => {
  const { href } = window.location;
  const url = new URL(href);
  window.location.href = `${url.pathname}#/events/${id}`;
};

type CardGridListProps = { data: EventsListRecord };

const CardGridList = ({ data }: CardGridListProps) => {
  const [, setCurrentEvent] = useStore<CurrentEvent | null>("currentEvent", null);

  const handleClick = () => {
    setCurrentEvent(data as CurrentEvent);
    localStorage.setItem(
      "currEvent",
      JSON.stringify({
        id: data.id,
        name: data.name,
        hijriYear: data.hijriYear,
        slug: data.slug,
        zabihat: data.zabihat,
        chairs: data.chairs,
      })
    );
    navigateToBaseRoute("events", String(data.id));
  };

  return (
    <Grid
      sx={styles.tile}
      key={data.id}
      size={{
        lg: 3,
        xs: 12,
      }}
    >
      <Card sx={styles.card}>
        <CardActionArea onClick={handleClick}>
          <Box
            sx={{
              display: "flex",
              aspectRatio: "2 / 1",
              justifyContent: "center",
              bgcolor: "background.paper",
              p: 2,
            }}
          >
            <img
              src={
                data.image || `https://placehold.jp/30/1a237e/ffffff/330x100.png?text=${data.name}`
              }
              style={{ maxWidth: "100%", maxHeight: "100%", height: "auto", alignSelf: "center" }}
              alt={data.name}
            />
          </Box>
        </CardActionArea>
        <CardContent sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
          <Typography component="div">{data.name}</Typography>
          <Typography>{`${dayjs(data.fromDate).format("D")} - ${dayjs(data.toDate).format(
            "D MMMM YYYY"
          )}`}</Typography>
        </CardContent>
        <CardActions>
          <Button size="small" color="primary" onClick={handleClick}>
            <Typography color="primary">View</Typography>
          </Button>
          <Button size="small" color="primary" onClick={() => editEvent(data.id)}>
            <Typography color="primary">Edit </Typography>
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
};

const LoadedGridList = ({ events }: { events: EventsListRecord[] }) => (
  <div style={{ marginBottom: "100px" }}>
    {events.length > 0 && (
      <Grid container spacing={3} alignItems="center" sx={styles.grid}>
        {events.map((d) => (
          <CardGridList data={d} key={d.id} />
        ))}
      </Grid>
    )}
  </div>
);

type EventsDashboardGridListProps = { isLoading?: boolean; events?: EventsListRecord[] };

export const EventsDashboardGridList = ({ isLoading, ...props }: EventsDashboardGridListProps) =>
  isLoading ? <LoadingGridList /> : <LoadedGridList events={props.events ?? []} />;
