import Icon from "@mui/icons-material/SupervisorAccountTwoTone";
import SabilDataList from "./SabilDataList";
import SabilDataCreate from "./create";
import SabilDataShow from "./show";
import SabilDataEdit from "./edit";

export default {
  list: SabilDataList,
  create: SabilDataCreate,
  edit: SabilDataEdit,
  show: SabilDataShow,
  icon: Icon,
  label: "Sabil Data",
  options: { label: "Sabil Data" },
  name: "sabilData",
};
