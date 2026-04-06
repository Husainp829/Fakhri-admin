import dayjs from "dayjs";

type TakhmeenFormData = {
  fmbId?: string;
  takhmeenAmount?: string | number;
  hijriYearStart?: string | number | null;
  startDate?: string | Date;
};

export function transformTakhmeenCreate(data: TakhmeenFormData) {
  const hijriYearStart =
    data.hijriYearStart != null && data.hijriYearStart !== "" ? Number(data.hijriYearStart) : null;
  if (hijriYearStart == null || !Number.isFinite(hijriYearStart)) {
    throw new Error("Please select a Hijri period.");
  }
  return {
    fmbId: data.fmbId,
    takhmeenAmount: Number(data.takhmeenAmount),
    hijriYearStart,
    hijriYearEnd: hijriYearStart + 1,
    startDate: dayjs(data.startDate).startOf("month").toISOString(),
  };
}

/** Update: omit fmbId (immutable); hijriYearStart is selected explicitly in the form. */
export function transformTakhmeenUpdate(data: TakhmeenFormData) {
  const hijriYearStart =
    data.hijriYearStart != null && data.hijriYearStart !== "" ? Number(data.hijriYearStart) : null;
  if (hijriYearStart == null || !Number.isFinite(hijriYearStart)) {
    throw new Error("Please select a Hijri period.");
  }
  return {
    takhmeenAmount: Number(data.takhmeenAmount),
    hijriYearStart,
    hijriYearEnd: hijriYearStart + 1,
    startDate: dayjs(data.startDate).startOf("month").toISOString(),
  };
}
