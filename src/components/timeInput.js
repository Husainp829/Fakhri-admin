import React from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import TextField from "@mui/material/TextField";
import { useInput } from "react-admin";
import dayjs from "dayjs";

function TimePickerInput(props) {
  const { field } = useInput(props);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        {...field}
        value={dayjs(field.value, "hh:mm:ss")}
        label={props.label}
        renderInput={(params) => <TextField {...params} style={{ width: "200px" }} />}
        ampm={false}
      />
    </LocalizationProvider>
  );
}

export default TimePickerInput;
