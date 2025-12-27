import React from "react";
import { Grid, Card, CardContent } from "@mui/material";
import TakhmeenAmountTable from "./TakhmeenAmountTable";

const TakhmeenAmountTables = ({ takhmeenAmountCountsByType, redirect }) => {
  const sabilTypes = Object.keys(takhmeenAmountCountsByType);

  return (
    <Grid container spacing={2}>
      {sabilTypes.map((type) => (
        <Grid item size={{ xs: 12, md: 6 }} key={type}>
          <Card elevation={2}>
            <CardContent>
              <TakhmeenAmountTable
                sabilType={type}
                data={takhmeenAmountCountsByType[type]}
                redirect={redirect}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default TakhmeenAmountTables;
