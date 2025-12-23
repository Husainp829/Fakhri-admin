import React, { useState } from "react";
import { TextInput, useDataProvider } from "react-admin";
import CircularProgress from "@mui/material/CircularProgress";
import Search from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { useFormContext } from "react-hook-form";

const useStyles = makeStyles(() => ({
  input: {
    width: "100%",
    marginRight: 2,
    marginTop: 2,
  },
  button: {
    marginTop: 2,
  },
  row: {
    cursor: "pointer",
  },
}));

function MiqaatNiyaazITSLookup() {
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
          setValue("name", data[0].Full_Name);
        } else {
          setNoResult(true);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Box sx={{ display: "flex", width: "100%" }}>
        <TextInput
          source="itsNo"
          label="ITS No"
          onChange={(e) => onChangeDetails(e)}
          className={classes.input}
          helperText={false}
          fullWidth
          sx={{ mr: 2 }}
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
      {noResult && <Typography sx={{ my: 3 }}>ITS Not Found in Jamaat</Typography>}
    </>
  );
}

export default MiqaatNiyaazITSLookup;
