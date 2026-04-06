import Icon from "@mui/icons-material/CalendarMonth";
import { BookingPurposeList } from "./BookingPurposeList";
import { BookingPurposeShow } from "./BookingPurposeShow";
import { BookingPurposeCreate } from "./BookingPurposeCreate";
import { BookingPurposeEdit } from "./BookingPurposeEdit";

export default {
  list: BookingPurposeList,
  show: BookingPurposeShow,
  create: BookingPurposeCreate,
  edit: BookingPurposeEdit,
  icon: Icon,
  label: "Purpose",
  options: { label: "Purpose" },
  name: "bookingPurpose",
};
