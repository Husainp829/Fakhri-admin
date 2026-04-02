import React, { useState, useEffect } from "react";
import { Card, CardContent, Grid, TextField, Button, Typography } from "@mui/material";

/**
 * Common Date Range Filter Component
 * Syncs with URL params and provides date range filtering
 *
 * @param {Object} props
 * @param {string} props.defaultStartDate - Default start date (YYYY-MM-DD format)
 * @param {string} props.defaultEndDate - Default end date (YYYY-MM-DD format)
 * @param {Function} props.onDateChange - Callback when dates are applied: (startDate, endDate) => void
 * @param {boolean} props.showTitle - Whether to show the title (default: false)
 */
export default function DateRangeFilter({
  defaultStartDate,
  defaultEndDate,
  onDateChange,
  showTitle = false,
}) {
  // Helper function to get date range from URL params
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

  // Helper function to update URL params with date range
  const updateURLParams = (startDate, endDate) => {
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

  // Initialize from URL params or defaults
  const initialDateRange = getDateRangeFromURL();
  const [startDate, setStartDate] = useState(initialDateRange.startDate);
  const [endDate, setEndDate] = useState(initialDateRange.endDate);

  // Sync with URL params when they change (e.g., browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const urlRange = getDateRangeFromURL();
      setStartDate(urlRange.startDate);
      setEndDate(urlRange.endDate);
      if (onDateChange) {
        onDateChange(urlRange.startDate, urlRange.endDate);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [onDateChange, defaultStartDate, defaultEndDate]);

  const handleApply = () => {
    updateURLParams(startDate, endDate);
    if (onDateChange) {
      onDateChange(startDate, endDate);
    }
  };

  const handleClear = () => {
    const clearedStartDate = defaultStartDate || "";
    const clearedEndDate = defaultEndDate || "";
    setStartDate(clearedStartDate);
    setEndDate(clearedEndDate);

    // Remove date params from URL
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

    if (onDateChange) {
      onDateChange(clearedStartDate, clearedEndDate);
    }
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
          <Grid item size={{ xs: 12, sm: 4 }}>
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
          <Grid item size={{ xs: 12, sm: 4 }}>
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
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Button
              variant="contained"
              onClick={handleApply}
              fullWidth
              sx={{ height: "40px" }}
            >
              Apply
            </Button>
          </Grid>
          <Grid item size={{ xs: 12, sm: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClear}
              fullWidth
              sx={{ height: "40px" }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
