import { Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { fromGregorian } from "@/utils/hijri-date-utils";

export function OhbatMajlisMonthDateHeader({
  date,
  onDrillDown,
}: {
  date: Date;
  onDrillDown: () => void;
}) {
  const gregorianDay = dayjs(date).date();
  const hijriDay = fromGregorian(date, "code");
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  return (
    <Button variant="text" size="small" onClick={onDrillDown}>
      <Typography
        component="span"
        variant="caption"
        sx={{ fontSize: isMobile ? "0.6rem" : "0.8rem" }}
      >
        {gregorianDay} | {hijriDay}
      </Typography>
    </Button>
  );
}
