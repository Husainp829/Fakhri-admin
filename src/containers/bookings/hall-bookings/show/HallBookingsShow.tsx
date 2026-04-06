import {
  Show,
  TabbedShowLayout,
  usePermissions,
  useShowController,
  type ShowProps,
} from "react-admin";
import { BookingInfoTab } from "./BookingInfoTab";
import { ReceiptsTab } from "./ReceiptsTab";
import { HallBookingsShowActions } from "./components/HallBookingsShowActions";
import { BookingShowProvider } from "./BookingShowContext";
import { hasPermission } from "@/utils/permission-utils";

export const HallBookingsShow = (props: ShowProps) => {
  const { record } = useShowController(props);
  const { permissions } = usePermissions();
  if (!record) return null;

  return (
    <BookingShowProvider record={record}>
      <Show
        {...props}
        actions={hasPermission(permissions, "bookings.edit") && <HallBookingsShowActions />}
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

export default HallBookingsShow;
