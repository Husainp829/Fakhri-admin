import Icon from "@mui/icons-material/RiceBowl";
import { NiyaazList } from "./NiyaazList";
import { NiyaazCreate } from "./create/NiyaazCreate";
import { NiyaazShow } from "./show/NiyaazShow";
import { NiyaazEdit } from "./edit/NiyaazEdit";

export default {
  list: NiyaazList,
  create: NiyaazCreate,
  show: NiyaazShow,
  edit: NiyaazEdit,
  icon: Icon,
  label: "Niyaaz",
  options: { label: "Niyaaz" },
  name: "niyaaz",
};
