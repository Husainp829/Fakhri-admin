/**
 * Global resources shown regardless of baseRoute.
 */
import admin from "@/containers/admin";
import itsdata from "@/containers/itsdata";
import itsdataAddressChangeQueue from "@/containers/itsdata-address-change-queue";
import whatsappBroadcasts from "@/containers/whatsapp-broadcasts";
import cronStatus from "@/containers/cron-status";
import sequences from "@/containers/sequences";

import type { GlobalResourceConfig } from "@/types/react-admin-config";

export const GLOBAL_RESOURCES: GlobalResourceConfig[] = [
  { permission: "admins.view", resource: admin },
  { permission: "itsdata.dump", resource: itsdata },
  { permission: "itsdata.dump", resource: itsdataAddressChangeQueue },
  { permission: "admins.view", resource: whatsappBroadcasts },
  { permission: "cronStatus.view", resource: cronStatus, name: "cronStatus" },
  { permission: "sequences.view", resource: sequences },
];
