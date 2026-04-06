import Icon from "@mui/icons-material/CalendarMonth";
import FmbDeliveryScheduleProfileList from "./FmbDeliveryScheduleProfileList";
import FmbDeliveryScheduleProfileCreate from "./FmbDeliveryScheduleProfileCreate";
import FmbDeliveryScheduleProfileEdit from "./FmbDeliveryScheduleProfileEdit";

export default {
  list: FmbDeliveryScheduleProfileList,
  create: FmbDeliveryScheduleProfileCreate,
  edit: FmbDeliveryScheduleProfileEdit,
  icon: Icon,
  label: "Delivery schedules",
  options: { label: "Delivery schedules" },
  name: "fmbDeliveryScheduleProfile",
};
