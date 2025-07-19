/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import { FunctionField, NumberField, SimpleShowLayout, TextField } from "react-admin";
import { Grid } from "@mui/material";
// import NiyaazDataGrid from "../common/niyaazDataGrid";
// import { calcTotalPayable } from "../../../utils";
import { EventContext } from "../../../dataprovider/eventProvider";

export default () => {
  const { currentEvent } = useContext(EventContext);
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={3}>
        <SimpleShowLayout>
          <TextField source="organiser" emptyText="-" />
          <TextField source="itsNo" label="ITS NO." />
          <TextField source="phone" label="Phone" />
        </SimpleShowLayout>
      </Grid>
      <Grid item xs={12} sm={4}>
        <SimpleShowLayout>
          <NumberField source="depositAmount" label="Deposit Amount" />
          <NumberField source="thaalAmount" label="Thaals" />
          <NumberField source="rentAmount" label="Rent" />
        </SimpleShowLayout>
      </Grid>
      <Grid item xs={12} sm={4}>
        <SimpleShowLayout>
          {/* <FunctionField
            source="total"
            label="Total Payable"
            render={(record) => <h2>₹ {calcTotalPayable(currentEvent, record)}</h2>}
          /> */}
          <FunctionField
            source="paidAmount"
            label="Paid Amount"
            render={(record) => <h2>₹ {record.paidAmount}</h2>}
          />
          <FunctionField
            source="depositPaidAmount"
            label="Deposit Paid Amount"
            render={(record) => <h2>₹ {record.depositPaidAmount}</h2>}
          />
          {/* <FunctionField
            source="pending"
            label="Pending Balance"
            render={(record) => (
              <h2>₹ {calcTotalPayable(currentEvent, record) - record.paidAmount}</h2>
            )}
          /> */}
        </SimpleShowLayout>
      </Grid>
      <Grid item xs={12} sm={12} sx={{ pt: 2, borderTop: "1px solid #efefef" }}>
        {/* <SimpleShowLayout>
          <ArrayField source="previousNiyaazHistory">
            <NiyaazDataGrid />
          </ArrayField>
        </SimpleShowLayout> */}
      </Grid>
    </Grid>
  );
};
