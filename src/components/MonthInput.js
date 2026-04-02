import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Box from "@mui/material/Box";
import { useInput } from "react-admin";
import dayjs from "dayjs";

/**
 * Month/year picker for react-admin. MUI X + AdapterDayjs require a Dayjs (or null) `value`;
 * react-hook-form often stores a date string — convert both ways to avoid `value.isValid is not a function`.
 */
function MonthInput(props) {
  const { field, fieldState, isRequired } = useInput(props);
  const { value: rawValue, onChange, onBlur, name, ref } = field;

  const isEmpty = rawValue === null || rawValue === undefined || rawValue === "";
  let value = null;
  if (!isEmpty) {
    const parsed = dayjs(rawValue);
    if (parsed.isValid()) {
      value = parsed;
    }
  }

  const handleChange = (newValue) => {
    if (newValue == null) {
      onChange(null);
      return;
    }
    const d = dayjs(newValue);
    if (d.isValid()) {
      onChange(d.startOf("month").format("YYYY-MM-DD"));
    } else {
      onChange(null);
    }
  };

  const minDate = dayjs().startOf("month");

  return (
    <Box sx={{ mb: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={props.label ? `${props.label} (mm/yyyy)` : "Month (mm/yyyy)"}
          value={value}
          onChange={handleChange}
          views={["month", "year"]}
          openTo="month"
          minDate={minDate}
          slotProps={{
            textField: {
              fullWidth: true,
              name,
              inputRef: ref,
              onBlur,
              error: !!fieldState?.error,
              helperText: fieldState?.error?.message,
              required: isRequired,
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}

export default MonthInput;
