import React from "react";
import { Card, CardContent, Typography, Grid, TextField, Button } from "@mui/material";

const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, onApply }) => (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Date Range Filter
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
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
              onChange={(e) => onEndDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 4 }}>
            <Button variant="contained" onClick={onApply} fullWidth sx={{ height: "40px" }}>
              Apply Filter
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

export default DateRangeFilter;
