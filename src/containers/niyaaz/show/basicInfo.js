import React, { useContext } from "react";
import { ArrayField, FunctionField, NumberField, SimpleShowLayout, TextField } from "react-admin";
import Grid from "@mui/material/GridLegacy";
import NiyaazDataGrid from "../common/niyaazDataGrid";
import { calcTotalPayable } from "../../../utils";
import { EventContext } from "../../../dataprovider/eventProvider";

export default () => {
  const { currentEvent } = useContext(EventContext);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={3}>
        <SimpleShowLayout>
          <TextField source="HOFName" label="Name" emptyText="-" />
          <TextField source="HOFId" label="ITS NO." />
          <TextField source="HOFPhone" label="Phone" />
        </SimpleShowLayout>
      </Grid>
      <Grid item xs={12} sm={4}>
        <SimpleShowLayout>
          <NumberField source="takhmeenAmount" label="Takhmeen" />
          <NumberField source="chairs" label="Chairs" />
          <NumberField source="iftaari" label="Iftaari" />
          <NumberField source="zabihat" label="Zabihat" />
        </SimpleShowLayout>
      </Grid>
      <Grid item xs={12} sm={4}>
        <SimpleShowLayout>
          <FunctionField
            source="total"
            label="Total Payable"
            render={(record) => <h2>₹ {calcTotalPayable(currentEvent, record)}</h2>}
          />
          <FunctionField
            source="paidAmount"
            label="Paid Amount"
            render={(record) => <h2>₹ {record.paidAmount}</h2>}
          />
          <FunctionField
            source="pending"
            label="Pending Balance"
            render={(record) => (
              <h2>₹ {calcTotalPayable(currentEvent, record) - record.paidAmount}</h2>
            )}
          />
        </SimpleShowLayout>
      </Grid>
      <Grid item xs={12} sm={12} sx={{ pt: 2, borderTop: "1px solid #efefef" }}>
        <SimpleShowLayout>
          <ArrayField source="previousNiyaazHistory">
            <NiyaazDataGrid />
          </ArrayField>
        </SimpleShowLayout>
      </Grid>
    </Grid>
  );
};
