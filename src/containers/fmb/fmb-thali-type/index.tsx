import Icon from "@mui/icons-material/LocalDining";
import FmbThaliTypeCreate from "./FmbThaliTypeCreate";
import FmbThaliTypeEdit from "./FmbThaliTypeEdit";
import FmbThaliTypeList from "./FmbThaliTypeList";

export default {
  name: "fmbThaliType",
  list: FmbThaliTypeList,
  create: FmbThaliTypeCreate,
  edit: FmbThaliTypeEdit,
  icon: Icon,
  label: "Thali types",
  options: { label: "Thali types" },
};
