import Icon from "@mui/icons-material/CalendarMonth";
import FmbDailyMenuCreate from "./FmbDailyMenuCreate";
import FmbDailyMenuEdit from "./FmbDailyMenuEdit";
import FmbDailyMenuList from "./FmbDailyMenuList";

export default {
  name: "fmbDailyMenu",
  list: FmbDailyMenuList,
  create: FmbDailyMenuCreate,
  edit: FmbDailyMenuEdit,
  icon: Icon,
  label: "Daily menus",
  options: { label: "Daily menus" },
};
