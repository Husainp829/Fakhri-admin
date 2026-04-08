import type { ChangeEvent } from "react";
import type { RaRecord } from "react-admin";
import { useState } from "react";
import { TextInput, useDataProvider } from "react-admin";
import CircularProgress from "@mui/material/CircularProgress";
import Search from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useFormContext } from "react-hook-form";

function LagatItsLookup() {
  const { setValue } = useFormContext();
  const dataProvider = useDataProvider();
  const [itsNo, setIts] = useState<string | undefined>();
  const [noResult, setNoResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChangeDetails = (e: ChangeEvent<HTMLInputElement>) => {
    setIts(e.target.value);
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
          includeFamily: true,
        },
      })
      .then(({ data }: { data: RaRecord[] }) => {
        if (data.length > 0) {
          setValue("itsNo", data[0].ITS_ID);
          setValue("name", data[0].Full_Name);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <TextInput
          source="itsNo"
          label="ITS No"
          onChange={(e) => onChangeDetails(e)}
          helperText={false}
          fullWidth
          sx={{ flex: 1, minWidth: 0, mr: 2, mt: 2 }}
          isRequired
        />
        <Search
          onClick={searchITS}
          variant="contained"
          sx={{ mt: 2, flexShrink: 0 }}
          disabled={loading}
        >
          {!loading ? <SearchIcon /> : <CircularProgress size={20} />}
        </Search>
      </Box>
      {noResult && <Typography sx={{ my: 3 }}>ITS Not an HOF or Not Found in Jamaat</Typography>}
    </>
  );
}

export default LagatItsLookup;
