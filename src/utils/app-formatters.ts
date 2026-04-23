/* eslint-disable no-console */
import { formatReceiptStoredDateTime, formatReceiptStoredDdMmYyyy } from "./date-format";

export const getCurrentEvent = (): Record<string, unknown> => {
  const jsonString = localStorage.getItem("currEvent");
  return JSON.parse(jsonString || "{}") as Record<string, unknown>;
};

export const goToLogin = (): void => {
  const { href } = window.location;
  const url = new URL(href);
  window.location.href = `${url.origin}/#/login`;
};

const getTimezoneOffset = (value: Date): number => value.getTimezoneOffset() * 60000;

export const parseDateTime = (value: string | number | Date): Date => {
  const dateTime = new Date(value);
  const utcFromLocal = new Date(dateTime.getTime() - getTimezoneOffset(dateTime));
  return utcFromLocal;
};

export const formatDateTime = formatReceiptStoredDateTime;

export const formatDate = formatReceiptStoredDdMmYyyy;

export const formatINR = (
  amount: unknown,
  opts: { empty?: string; minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string => {
  const { empty = "—", minimumFractionDigits = 0, maximumFractionDigits = 0 } = opts || {};
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return empty;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(amount));
};

export const groupBy =
  <T extends Record<string, unknown>>(key: keyof T) =>
  (array: T[]): Record<string, T[]> =>
    array.reduce(
      (objectsByKeyValue, obj) => {
        const value = String(obj[key]);
        const acc = objectsByKeyValue;
        acc[value] = (acc[value] || []).concat(obj);
        return acc;
      },
      {} as Record<string, T[]>
    );

type ReceiptGroupRow = {
  markaz: string;
  day: string;
  mode: string;
  totalAmount: number;
};

export const receiptGroupBy = (
  array: ReceiptGroupRow[]
): Record<string, Record<string, Record<string, number>>> =>
  array.reduce<Record<string, Record<string, Record<string, number>>>>((acc, curr) => {
    const curMarkaz = acc[curr.markaz] || {};
    const curDay = curMarkaz[curr.day] || {};
    return {
      ...acc,
      [curr.markaz]: {
        ...curMarkaz,
        [curr.day]: {
          ...curDay,
          [curr.mode]: curr.totalAmount,
        },
      },
    };
  }, {});

export type NiyaazPayableEvent = {
  chairs?: number;
  zabihat?: number;
};

export type NiyaazPayableData = {
  takhmeenAmount?: string | number;
  iftaari?: string | number;
  chairs?: string | number;
  zabihat?: string | number;
  paidAmount?: string | number;
};

export const calcTotalPayable = (
  currentEvent: NiyaazPayableEvent,
  data: NiyaazPayableData = {}
): number => {
  const takhmeenAmount = parseInt(String(data.takhmeenAmount), 10);
  const iftaari = parseInt(String(data.iftaari), 10);
  const chairs = (currentEvent.chairs ?? 0) * parseInt(String(data.chairs), 10);
  const zabihat = (currentEvent.zabihat ?? 0) * parseInt(String(data.zabihat), 10);
  return takhmeenAmount + chairs + zabihat + iftaari;
};

export const calcTotalBalance = (
  currentEvent: NiyaazPayableEvent,
  data: NiyaazPayableData = {}
): number => {
  const totalPayable = calcTotalPayable(currentEvent, data);
  const paidAmount = parseInt(String(data.paidAmount), 10);
  return totalPayable - paidAmount;
};

export const mS: boolean = !!(
  document.body.clientWidth >= 1024 || document.documentElement.clientWidth >= 1024
);
