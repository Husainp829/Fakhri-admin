import Icon from "@mui/icons-material/Schedule";
import CronStatusList from "./CronStatusList";
import CronStatusShow from "./CronStatusShow";

export default {
  list: CronStatusList,
  show: CronStatusShow,
  icon: Icon,
  label: "Cron Status",
  options: { label: "Cron Status" },
  name: "cronStatus",
};
