import React from "react";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useInput } from "react-admin";
import dayjs from "dayjs";

function MonthInput(props) {
  const { field } = useInput(props);
  const now = dayjs();

  return (
    <Box sx={{ mb: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          {...field}
          label={`${props.label} (mm/yyyy)`}
          renderInput={(params) => <TextField {...params} style={{ width: "100%" }} />}
          views={["month", "year"]}
          ampm={false}
          minDate={now.month(now.month() + 1)}
          // inputFormat="MMM"
          fullWidth
        />
      </LocalizationProvider>
    </Box>
  );
}

export default MonthInput;
