import Icon from "@mui/icons-material/EventBusy";
import FmbHolidayList from "./FmbHolidayList";
import FmbHolidayCreate from "./FmbHolidayCreate";
import FmbHolidayEdit from "./FmbHolidayEdit";

export default {
  list: FmbHolidayList,
  create: FmbHolidayCreate,
  edit: FmbHolidayEdit,
  icon: Icon,
  label: "FMB holidays",
  options: { label: "FMB holidays" },
  name: "fmbHoliday",
};
