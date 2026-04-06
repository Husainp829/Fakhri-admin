import { useState, useEffect } from "react";
import { Card, CardContent, TextField, Button, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

export type DateRangeFilterProps = {
  defaultStartDate?: string;
  defaultEndDate?: string;
  onDateChange?: (startDate: string, endDate: string) => void;
  showTitle?: boolean;
};

export default function DateRangeFilter({
  defaultStartDate,
  defaultEndDate,
  onDateChange,
  showTitle = false,
}: DateRangeFilterProps) {
  const getDateRangeFromURL = () => {
    if (typeof window === "undefined") {
      return {
        startDate: defaultStartDate || "",
        endDate: defaultEndDate || "",
      };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const startDate = urlParams.get("startDate");
    const endDate = urlParams.get("endDate");

    if (startDate && endDate) {
      return { startDate, endDate };
    }

    return {
      startDate: defaultStartDate || "",
      endDate: defaultEndDate || "",
    };
  };

  const updateURLParams = (startDate: string, endDate: string) => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);

    if (startDate) {
      urlParams.set("startDate", startDate);
    } else {
      urlParams.delete("startDate");
    }

    if (endDate) {
      urlParams.set("endDate", endDate);
    } else {
      urlParams.delete("endDate");
    }

    const queryString = urlParams.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  };

  const initialDateRange = getDateRangeFromURL();
  const [startDate, setStartDate] = useState(initialDateRange.startDate);
  const [endDate, setEndDate] = useState(initialDateRange.endDate);

  useEffect(() => {
    const handlePopState = () => {
      const urlRange = getDateRangeFromURL();
      setStartDate(urlRange.startDate);
      setEndDate(urlRange.endDate);
      onDateChange?.(urlRange.startDate, urlRange.endDate);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // getDateRangeFromURL reads window + defaults; omitting avoids duplicate logic vs. initial state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDateChange, defaultStartDate, defaultEndDate]);

  const handleApply = () => {
    updateURLParams(startDate, endDate);
    onDateChange?.(startDate, endDate);
  };

  const handleClear = () => {
    const clearedStartDate = defaultStartDate || "";
    const clearedEndDate = defaultEndDate || "";
    setStartDate(clearedStartDate);
    setEndDate(clearedEndDate);

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("startDate");
      urlParams.delete("endDate");

      const queryString = urlParams.toString();
      const newUrl = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }

    onDateChange?.(clearedStartDate, clearedEndDate);
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        {showTitle && (
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Date Range Filter
          </Typography>
        )}
        <Grid container spacing={2} alignItems="center">
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <Button variant="contained" onClick={handleApply} fullWidth sx={{ height: "40px" }}>
              Apply
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 2,
            }}
          >
            <Button variant="outlined" onClick={handleClear} fullWidth sx={{ height: "40px" }}>
              Clear
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
