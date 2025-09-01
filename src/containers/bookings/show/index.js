import * as React from "react";
import { Show, TabbedShowLayout, useShowController } from "react-admin";
import BookingInfoTab from "./BookingInfoTab";
import ReceiptsTab from "./ReceiptsTab";
import BookingShowActions from "./components/BookingActionButtons";
import { BookingShowProvider } from "./context";

const BookingShow = (props) => {
  const { record } = useShowController(props);
  if (!record) return null;

  return (
    <BookingShowProvider record={record}>
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
    </BookingShowProvider>
  );
};

export default BookingShow;
