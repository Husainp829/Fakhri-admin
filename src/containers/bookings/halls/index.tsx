import Icon from "@mui/icons-material/Warehouse";
import { HallsCreate } from "./HallsCreate";
import { HallsEdit } from "./HallsEdit";
import { HallsList } from "./HallsList";
import { HallsShow } from "./HallsShow";

export default {
  list: HallsList,
  create: HallsCreate,
  edit: HallsEdit,
  show: HallsShow,
  icon: Icon,
  label: "Halls",
  options: { label: "Halls" },
  name: "halls",
};
