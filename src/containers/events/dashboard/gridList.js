import React from "react";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/GridLegacy";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import { useStore } from "react-admin";

import Button from "@mui/material/Button";
import dayjs from "dayjs";
import { navigateToBaseRoute } from "../../../utils/routeUtility";

const styles = {
  container: {
    marginBottom: "100px",
  },
  grid: {
    marginTop: "0px",
  },
  gridList: {
    margin: 0,
  },
  tileBar: {},
  placeholder: {
    backgroundColor: (theme) => theme.palette.grey[300],
    height: "100%",
  },
  price: {
    display: "inline",
    fontSize: "1em",
  },
  link: {
    color: "#fff",
  },
  tile: {
    maxHeight: "350px",
  },
  media: {},
  card: {},
};

const LoadingGridList = () => (
  <Grid container spacing={2} alignItems="center" sx={styles.grid}>
    {[...Array(8).keys()].map((i) => (
      <Grid item lg={3} key={i}>
        <Skeleton variant="rectangular" width="100%" height={310} />
      </Grid>
    ))}
  </Grid>
);

const editEvent = (id) => {
  const { href } = window.location;
  const url = new URL(href);
  window.location = `${url.pathname}#/events/${id}`;
};

const CardGridList = ({ data }) => {
  const [, setCurrentEvent] = useStore("currentEvent", null);
  return (
    <Grid item lg={3} xs={12} sx={styles.tile} key={data.id}>
      <Card sx={styles.card}>
        <CardActionArea
          onClick={() => {
            navigateToBaseRoute("events", data.id);
          }}
        >
          <div
            style={{
              display: "flex",
              aspectRatio: "2 / 1",
              justifyContent: "center",
              background: "#fff",
              padding: "1em",
            }}
          >
            <img
              src={
                data.image || `https://placehold.jp/30/1a237e/ffffff/330x100.png?text=${data.name}`
              }
              style={{ maxWidth: "100%", maxHeight: "100%", height: "auto", alignSelf: "center" }}
              alt={data.name}
            />
          </div>
        </CardActionArea>
        <CardContent style={{ background: "#0a1f31" }}>
          <Typography component="div" color="white">
            {data.name}
          </Typography>
          <Typography color="white">{`${dayjs(data.fromDate).format("D")} - ${dayjs(
            data.toDate
          ).format("D MMMM YYYY")}`}</Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={() => {
              setCurrentEvent(data);
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
              navigateToBaseRoute("events", data.id);
            }}
          >
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

const LoadedGridList = ({ events }) => (
  <div style={styles.container}>
    {events.length > 0 && (
      <Grid container spacing={3} alignItems="center" sx={styles.grid}>
        {events.map((d) => (
          <CardGridList data={d} key={d.id} />
        ))}
      </Grid>
    )}
  </div>
);

const GridList = ({ isLoading, ...props }) =>
  isLoading ? <LoadingGridList /> : <LoadedGridList {...props} />;

export default GridList;
