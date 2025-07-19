import React from "react";
import { ReferenceManyField } from "react-admin";

import ReceiptDataGrid from "../../rentBookingReceipt/dataGrid";

export default () => (
  <ReferenceManyField reference="contRcpt" target="bookingId" label={false}>
    <ReceiptDataGrid />
  </ReferenceManyField>
);
