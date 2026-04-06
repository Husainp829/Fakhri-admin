import Icon from "@mui/icons-material/Group";
import StaffCreate from "./StaffCreate";
import StaffEdit from "./StaffEdit";
import StaffList from "./StaffList";

export default {
  list: StaffList,
  edit: StaffEdit,
  create: StaffCreate,
  icon: Icon,
  label: "Staff",
  options: { label: "Staff" },
  name: "employees",
};
