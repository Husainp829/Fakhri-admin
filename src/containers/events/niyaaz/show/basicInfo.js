import React from "react";
import {
  ArrayField,
  FunctionField,
  NumberField,
  SimpleShowLayout,
  TextField,
} from "react-admin";
import Grid from "@mui/material/GridLegacy";
import NiyaazDataGrid from "../common/niyaazDataGrid";

export default () => (
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
            source="totalPayable"
            label="Total Payable"
            render={(record) => <h2>₹ {record.totalPayable || 0}</h2>}
          />
          <FunctionField
            source="paidAmount"
            label="Paid Amount"
            render={(record) => <h2>₹ {record.paidAmount || 0}</h2>}
          />
          <FunctionField
            source="balance"
            label="Pending Balance"
            render={(record) => <h2>₹ {record.balance || 0}</h2>}
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
