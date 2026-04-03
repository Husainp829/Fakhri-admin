import React from "react";
import { Grid, Card, CardContent } from "@mui/material";
import FmbTakhmeenAmountTable from "./FmbTakhmeenAmountTable";

const CATEGORY_LABELS = {
  THALI: "Thali",
  ANNUAL: "Annual",
  ZABIHAT: "Zabihat",
  VOLUNTARY: "Voluntary",
};

const FmbTakhmeenAmountTables = ({ takhmeenAmountCountsByType, redirect }) => {
  const keys = Object.keys(takhmeenAmountCountsByType || {});

  if (keys.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      {keys.map((key) => (
        <Grid item size={{ xs: 12, md: 6 }} key={key}>
          <Card elevation={2}>
            <CardContent>
              <FmbTakhmeenAmountTable
                categoryLabel={CATEGORY_LABELS[key] || key}
                data={takhmeenAmountCountsByType[key]}
                redirect={redirect}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FmbTakhmeenAmountTables;
