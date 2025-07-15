import React, { useState } from "react";
import { NumberInput, useDataProvider } from "react-admin";
import CircularProgress from "@mui/material/CircularProgress";
import Search from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { useFormContext } from "react-hook-form";

const useStyles = makeStyles((theme) => ({
  input: {
    width: "100%",
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  row: {
    cursor: "pointer",
  },
}));

function ITSLookup() {
  const classes = useStyles();
  const { setValue } = useFormContext();
  const dataProvider = useDataProvider();
  const [itsNo, setIts] = useState();
  const [noResult, setNoResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChangeDetails = (e) => {
    setIts(e.target.value);
  };

  const searchITS = () => {
    setNoResult(false);
    setLoading(true);
    dataProvider
      .getList("itsdata", {
        pagination: { page: 1, perPage: 10 },
        sort: {},
        filter: {
          q: String(itsNo),
          includeFamily: true,
        },
      })
      .then(({ data }) => {
        if (data.length > 0) {
          setValue("itsNo", data[0].ITS_ID);
          setValue("organiser", data[0].Full_Name);
          setValue("phone", data[0].Mobile);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <NumberInput
          source="itsNo"
          label="ITS No"
          onChange={(e) => onChangeDetails(e)}
          className={classes.input}
          helperText={false}
          isRequired
        />
        <Search
          onClick={searchITS}
          variant="contained"
          className={classes.button}
          disabled={loading}
        >
          {!loading ? <SearchIcon /> : <CircularProgress size={20} />}
        </Search>
      </Box>
      {noResult && <Typography sx={{ my: 3 }}>ITS Not an HOF or Not Found in Jamaat</Typography>}
    </>
  );
}

export default ITSLookup;
