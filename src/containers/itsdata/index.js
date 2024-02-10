import Icon from "@mui/icons-material/GridOn";
import { EditGuesser } from "react-admin";
import List from "./list";
import Create from "./create";

export default {
  list: List,
  edit: EditGuesser,
  create: Create,
  icon: Icon,
  label: "ITS Data",
  options: { label: "ITS Data" },
  name: "itsdata",
};
