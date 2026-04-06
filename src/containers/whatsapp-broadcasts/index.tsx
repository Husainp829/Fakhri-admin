import BroadcastIcon from "@mui/icons-material/Campaign";
import WhatsappBroadcastList from "./WhatsappBroadcastList";
import WhatsappBroadcastShow from "./WhatsappBroadcastShow";
import WhatsappBroadcastCreate from "./WhatsappBroadcastCreate";

export default {
  list: WhatsappBroadcastList,
  show: WhatsappBroadcastShow,
  create: WhatsappBroadcastCreate,
  icon: BroadcastIcon,
  name: "whatsappBroadcasts",
  label: "WhatsApp Broadcasts",
  options: { label: "WhatsApp Broadcasts" },
};
