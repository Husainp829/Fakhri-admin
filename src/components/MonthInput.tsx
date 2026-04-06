import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Box from "@mui/material/Box";
import { useInput, type InputProps } from "react-admin";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

function MonthInput(props: InputProps<string | null>) {
  const { field, fieldState, isRequired } = useInput(props);
  const { value: rawValue, onChange, onBlur, name, ref } = field;

  const isEmpty = rawValue === null || rawValue === undefined || rawValue === "";
  let value: Dayjs | null = null;
  if (!isEmpty) {
    const parsed = dayjs(rawValue);
    if (parsed.isValid()) {
      value = parsed;
    }
  }

  const handleChange = (newValue: Dayjs | null) => {
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
