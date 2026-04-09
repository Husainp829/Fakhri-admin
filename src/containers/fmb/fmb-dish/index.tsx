import Icon from "@mui/icons-material/Restaurant";
import FmbDishCreate from "./FmbDishCreate";
import FmbDishEdit from "./FmbDishEdit";
import FmbDishList from "./FmbDishList";

export default {
  name: "fmbDish",
  list: FmbDishList,
  create: FmbDishCreate,
  edit: FmbDishEdit,
  icon: Icon,
  label: "Dishes",
  options: { label: "Dishes" },
};
