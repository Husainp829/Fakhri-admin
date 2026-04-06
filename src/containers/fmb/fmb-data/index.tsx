import Icon from "@mui/icons-material/SupervisorAccountTwoTone";
import FmbDataList from "./FmbDataList";
import Create from "./create";
import Show from "./show";
import Edit from "./edit";

export default {
  list: FmbDataList,
  create: Create,
  edit: Edit,
  show: Show,
  icon: Icon,
  label: "FMB Data",
  options: { label: "FMB Data" },
  name: "fmbData",
};
