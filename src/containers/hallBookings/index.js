import Icon from "@mui/icons-material/BookOnlineTwoTone";
import List from "./list";
import Create from "./create";
import Show from "./show";

export default {
  list: List,
  icon: Icon,
  label: "Hall Bookings",
  options: { label: "Hall Bookings" },
  name: "hallBookings",
};

export const bookings = {
  create: Create,
  show: Show,
  icon: Icon,
  name: "bookings",
};
