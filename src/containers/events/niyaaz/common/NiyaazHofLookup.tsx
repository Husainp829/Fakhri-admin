import React, { useState } from "react";
import { Button, useDataProvider, useNotify } from "react-admin";
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
import { callApi } from "@/dataprovider/misc-apis";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

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

type ItsdataFamilyMember = {
  HOF_FM_TYPE: string;
  Full_Name: string;
  Age: string;
  Gender: string;
  ITS_ID: string;
};

export type ItsdataHofRecord = {
  id: string | number;
  ITS_ID: string;
  Full_Name: string;
  Address?: string;
  Mobile?: string;
  familyMembers?: ItsdataFamilyMember[];
};

function isPreviousHistoryPayload(data: unknown): data is { rows?: unknown[] } {
  return typeof data === "object" && data !== null && "rows" in data;
}

export default function NiyaazHofLookup() {
  const classes = useStyles();
  const notify = useNotify();
  const { setValue } = useFormContext();
  const [showDialog, setShowDialog] = useState(false);
  const dataProvider = useDataProvider();
  const [itsNo, setIts] = useState("");
  const [itsData, setData] = useState<ItsdataHofRecord[]>([]);
  const [noResult, setNoResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseClick = () => {
    setShowDialog(false);
  };

  const onChangeDetails = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIts(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && itsNo) {
      searchITS();
    }
  };

  const searchITS = () => {
    setNoResult(false);
    setLoading(true);
    dataProvider
      .getList("itsdata", {
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
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
        setData(data as ItsdataHofRecord[]);
      })
      .catch(() => undefined)
      .finally(() => {
        setLoading(false);
      });
  };

  const selectITS = (row: ItsdataHofRecord) => {
    setValue("HOFId", row.ITS_ID);
    setValue("HOFName", row.Full_Name);
    setValue("HOFAddress", row.Address);
    setValue("HOFPhone", row.Mobile);
    const family = (row.familyMembers || [])
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
        HOFId: row.ITS_ID,
        includeEventData: true,
      },
      method: "GET",
    })
      .then(({ data: previousHistory }) => {
        if (isPreviousHistoryPayload(previousHistory)) {
          setValue("previousHistory", previousHistory);
        }
      })
      .catch((err: Error) => {
        notify(err.message, { type: "warning" });
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
            <NoArrowKeyNumberInput
              source="HofITsNo"
              label="HOF ITS"
              onChange={onChangeDetails}
              onKeyDown={handleKeyPress}
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
            <Table aria-label="simple table">
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
