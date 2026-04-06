import Icon from "@mui/icons-material/BlockTwoTone";
import { BlockedHallDatesList } from "./BlockedHallDatesList";
import { BlockedHallDatesCreate } from "./BlockedHallDatesCreate";
import { BlockedHallDatesEdit } from "./BlockedHallDatesEdit";

export default {
  list: BlockedHallDatesList,
  create: BlockedHallDatesCreate,
  edit: BlockedHallDatesEdit,
  icon: Icon,
  label: "Blocked Hall Dates",
  options: { label: "Blocked Hall Dates" },
  name: "blockedHallDates",
};
