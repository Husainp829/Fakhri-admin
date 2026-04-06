import Icon from "@mui/icons-material/AdminPanelSettings";
import AdminCreate from "./AdminCreate";
import AdminEdit from "./AdminEdit";
import AdminList from "./AdminList";

export default {
  list: AdminList,
  edit: AdminEdit,
  create: AdminCreate,
  icon: Icon,
  label: "Admin",
  options: { label: "Admin" },
  name: "admins",
};
