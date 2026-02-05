/**
 * Global resources shown regardless of baseRoute.
 */
import admin from "../containers/admin";
import itsdata from "../containers/itsdata";
import whatsappBroadcasts from "../containers/whatsappBroadcasts";
import cronStatus from "../containers/cronStatus";
import sequences from "../containers/sequences";

/**
 * @typedef {Object} GlobalResourceConfig
 * @property {string} permission - Permission to view resource
 * @property {Object} resource - React-admin resource definition
 * @property {string} [name] - Override resource name (e.g. cronStatus)
 */
export const GLOBAL_RESOURCES = [
  { permission: "admins.view", resource: admin },
  { permission: "itsdata.dump", resource: itsdata },
  { permission: "admins.view", resource: whatsappBroadcasts },
  { permission: "cronStatus.view", resource: cronStatus, name: "cronStatus" },
  { permission: "sequences.view", resource: sequences },
];
