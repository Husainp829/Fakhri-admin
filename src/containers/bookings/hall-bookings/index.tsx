import Icon from "@mui/icons-material/BookOnlineTwoTone";
import { HallBookingsList } from "./list/HallBookingsList";
import { HallBookingsCreate } from "./create/HallBookingsCreate";
import { HallBookingsShow } from "./show/HallBookingsShow";

export default {
  list: HallBookingsList,
  icon: Icon,
  label: "Hall Bookings",
  options: { label: "Hall Bookings" },
  name: "hallBookings",
};

export const bookings = {
  create: HallBookingsCreate,
  show: HallBookingsShow,
  icon: Icon,
  name: "bookings",
};
