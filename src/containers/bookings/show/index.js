import * as React from "react";
import { Show, TabbedShowLayout, useShowController } from "react-admin";
import BookingInfoTab from "./BookingInfoTab";
import ReceiptsTab from "./ReceiptsTab";
import BookingShowActions from "./components/BookingActionButtons";

const BookingShow = (props) => {
  const { record } = useShowController(props);
  if (!record) return null;

  return (
    <Show {...props} actions={<BookingShowActions />}>
      <TabbedShowLayout>
        <TabbedShowLayout.Tab label="Information">
          <BookingInfoTab />
        </TabbedShowLayout.Tab>

        <TabbedShowLayout.Tab label="Receipts" path="receipts">
          <ReceiptsTab />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export default BookingShow;
