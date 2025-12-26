import * as React from "react";
import {
  Show,
  TabbedShowLayout,
  usePermissions,
  useShowController,
} from "react-admin";
import BookingInfoTab from "./BookingInfoTab";
import ReceiptsTab from "./ReceiptsTab";
import BookingShowActions from "./components/BookingActionButtons";
import { BookingShowProvider } from "./context";
import { hasPermission } from "../../../../utils/permissionUtils";

const BookingShow = (props) => {
  const { record } = useShowController(props);
  const { permissions } = usePermissions();
  if (!record) return null;

  return (
    <BookingShowProvider record={record}>
      <Show
        {...props}
        actions={
          hasPermission(permissions, "bookings.edit") && <BookingShowActions />
        }
      >
        <TabbedShowLayout>
          <TabbedShowLayout.Tab label="Information">
            <BookingInfoTab />
          </TabbedShowLayout.Tab>

          {hasPermission(permissions, "bookingReceipts.view") && (
            <TabbedShowLayout.Tab label="Receipts" path="receipts">
              <ReceiptsTab />
            </TabbedShowLayout.Tab>
          )}
        </TabbedShowLayout>
      </Show>
    </BookingShowProvider>
  );
};

export default BookingShow;
