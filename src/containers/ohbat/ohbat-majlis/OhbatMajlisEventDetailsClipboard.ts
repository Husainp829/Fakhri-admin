import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import startCase from "lodash/startCase";
import type { RaRecord } from "react-admin";
import { formatMajlisStartTimeLabel } from "./OhbatMajlisTime";

dayjs.extend(advancedFormat);

function clip(v: unknown): string {
  if (v == null || String(v).trim() === "") return "";
  return String(v).trim();
}

/** Indian mobile for WhatsApp: +916352816852 → +91 63528 16852 */
function formatMobileForMessage(mobile: unknown): string {
  const raw = clip(mobile);
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  let national = digits;
  if (digits.length === 12 && digits.startsWith("91")) {
    national = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    national = digits.slice(1);
  }
  if (national.length === 10) {
    return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
  }
  if (raw.startsWith("+")) return raw;
  return digits ? `+${digits}` : "";
}

function formatDateForMessage(isoDate: unknown): string {
  if (!isoDate) return "";
  const d = dayjs(String(isoDate));
  return d.isValid() ? d.format("dddd, Do MMMM YYYY") : "";
}

function formatTimeForMessage(hhmm: unknown): string {
  const label = formatMajlisStartTimeLabel(hhmm as string | null | undefined);
  return label === "—" ? "" : label;
}

/** WhatsApp-style confirmation message for hosts. */
export function buildOhbatMajlisEventDetailsText(record: RaRecord | null | undefined): string {
  if (!record) return "";

  const hostName = clip(record.hostName);
  const intro = hostName
    ? `${hostName}, your *Ohbat Majlis* is confirmed with the following details:`
    : "Your *Ohbat Majlis* is confirmed with the following details:";

  const dateStr = formatDateForMessage(record.date);
  const timeStr = formatTimeForMessage(record.startTime);
  const typeRaw = clip(record.type);
  const typeStr = typeRaw ? startCase(typeRaw) : "";
  const venueStr = clip(record.address);
  const sadarat = record.sadarat as { name?: string; mobile?: string } | undefined;
  const sadaratName = clip(sadarat?.name);
  const sadaratPhone = formatMobileForMessage(sadarat?.mobile);

  const parts = [
    "Salaam-e-Jameel,",
    "",
    intro,
    "",
    `📅 *Date:* ${dateStr}`,
    `🕗 *Time:* ${timeStr}`,
    `🍽️ *Type:* ${typeStr}`,
    `📍 *Venue:* ${venueStr}`,
    "",
    `*Sadarat:* ${sadaratName}`,
    ...(sadaratPhone ? [`📞 ${sadaratPhone}`] : []),
    "",
    "We request you to formally invite the Saheb and coordinate with him at your earliest for pick and drop arrangements.",
  ];

  return parts.join("\n");
}
