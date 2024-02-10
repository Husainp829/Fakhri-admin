import React from "react";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useInput } from "react-admin";

function DateTimeInput(props) {
  const { field } = useInput(props);
  return (
    <Box sx={{ mb: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          {...field}
          label={`${props.label} (mm/dd/yyyy hh:mm)`}
          renderInput={(params) => <TextField {...params} style={{ width: "100%" }} />}
          ampm={false}
          fullWidth
        />
      </LocalizationProvider>
    </Box>
  );
}

export default DateTimeInput;
