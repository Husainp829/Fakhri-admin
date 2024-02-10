import React from "react";

import { Card, Box, CardActionArea, CardContent, Typography, LinearProgress } from "@mui/material";
import { makeStyles } from "@mui/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { green } from "@mui/material/colors";

export default ({ progress }) => {
  const classes = useStyles();
  if (progress) {
    const p = Math.round(progress.value);
    return (
      <div sx={{ position: "fixed", bottom: 0, right: 0, padding: "10px" }}>
        <Card className={classes.card}>
          <CardActionArea>
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                Upload Status
              </Typography>
              <Box className={classes.fileName}>
                <Typography variant="h6" color="textSecondary">
                  <p style={{ margin: 0 }}>{progress.name}</p>
                </Typography>
                {p === 100 && <CheckCircleIcon className={classes.icon} />}
              </Box>
              {p !== 100 && (
                <Box display="flex" alignItems="center">
                  <Box width="100%" mr={1}>
                    <LinearProgress variant="determinate" value={p} />
                  </Box>
                  <Box minWidth={35}>
                    <Typography variant="h6" color="textSecondary">{`${p}%`}</Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </CardActionArea>
        </Card>
      </div>
    );
  }
  return null;
};

const useStyles = makeStyles(() => ({
  root: { position: "fixed", bottom: 0, right: 0, padding: "10px" },
  card: {
    width: 500,
    padding: "0.2rem",
  },
  icon: {
    display: "flex",
    color: green[500],
    paddingLeft: "10px",
  },
  fileName: { display: "flex", alignItems: "center" },
}));
