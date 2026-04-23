import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Box from "@mui/material/Box";
import { useInput, type InputProps } from "react-admin";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { AppDatePickerLocalization } from "@/components/AppDatePickerLocalization";
import { formatIsoDate, MUI_MONTH_YEAR_PICKER_FORMAT } from "@/utils/date-format";

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
      onChange(formatIsoDate(d.startOf("month")));
    } else {
      onChange(null);
    }
  };

  const minDate = dayjs().startOf("month");

  return (
    <Box sx={{ mb: 2 }}>
      <AppDatePickerLocalization>
        <DatePicker
          label={props.label ? `${props.label} (month & year)` : "Month & year"}
          format={MUI_MONTH_YEAR_PICKER_FORMAT}
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
      </AppDatePickerLocalization>
    </Box>
  );
}

export default MonthInput;
