/* eslint-disable no-console */
import React, { useState } from "react";
import { Button, NumberInput, useDataProvider, useNotify } from "react-admin";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import Dialog from "@mui/material/Dialog";
import Search from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { useFormContext } from "react-hook-form";
import { callApi } from "../../../../dataprovider/miscApis";

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

function HofLookup() {
  const classes = useStyles();
  const notify = useNotify();
  const { setValue } = useFormContext();
  const [showDialog, setShowDialog] = useState(false);
  const dataProvider = useDataProvider();
  const [itsNo, setIts] = useState();
  const [itsData, setData] = useState([]);
  const [noResult, setNoResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseClick = () => {
    setShowDialog(false);
  };

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
          isHOF: true,
          includeFamily: true,
        },
      })
      .then(({ data }) => {
        if (data.length === 0) {
          setNoResult(true);
        }
        setData(data);
      })
      .catch((e) => console.log(e))
      .finally(() => {
        setLoading(false);
      });
  };

  const selectITS = (data) => {
    setValue("HOFId", data.ITS_ID);
    setValue("HOFName", data.Full_Name);
    setValue("HOFAddress", data.Address);
    setValue("HOFPhone", data.Mobile);
    const family = (data?.familyMembers || [])
      .sort((a, b) => b.HOF_FM_TYPE.localeCompare(a.HOF_FM_TYPE))
      .map((fam) => ({
        name: fam.Full_Name,
        age: fam.Age,
        gender: fam.Gender,
        its: fam.ITS_ID,
      }));
    setValue("familyMembers", family);

    callApi({
      location: "niyaaz",
      data: {
        HOFId: data.ITS_ID,
        includeEventData: true,
      },
      method: "GET",
    })
      .then(({ data: previousHistory }) => {
        setValue("previousHistory", previousHistory);
      })
      .catch((err) => {
        notify(err.message);
      });

    handleCloseClick();
  };

  return (
    <>
      <Button onClick={handleClick} label="HOF Lookup" variant="contained" sx={{ ml: 3 }}>
        <SearchIcon />
      </Button>
      <Dialog fullWidth open={showDialog} onClose={handleCloseClick} aria-label="Select itsData">
        <DialogTitle>HOF Lookup</DialogTitle>

        <DialogContent>
          <Box sx={{ display: "flex" }}>
            <NumberInput
              source="HofITsNo"
              label="HOF ITS"
              onChange={(e) => onChangeDetails(e)}
              className={classes.input}
              helperText={false}
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
          {noResult && (
            <Typography sx={{ my: 3 }}>ITS Not an HOF or Not Found in Jamaat</Typography>
          )}
          {itsData.length > 0 && (
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>ITS No</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itsData.map((r) => (
                  <TableRow className={classes.row} key={r.id} onClick={() => selectITS(r)} hover>
                    <TableCell>{r.Full_Name}</TableCell>
                    <TableCell>{r.ITS_ID}</TableCell>
                    <TableCell>
                      <ArrowForwardIcon />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default HofLookup;
