import type { RaRecord } from "react-admin";

export type OhbatMajlisCalendarEvent = {
  id: string | number;
  title: string;
  subTitle: string;
  start: Date;
  end: Date;
  resource: RaRecord;
};
