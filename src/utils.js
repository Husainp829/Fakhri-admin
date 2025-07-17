/* eslint-disable no-console */
import React from "react";
import dayjs from "dayjs";
import ReactPDF from "@react-pdf/renderer";
import { Passes } from "./components/pdf.js";
import { PER_THAAL_COST } from "./constants";
export const getEventId = () => {
  const { href } = window.location;
  const u = new URL(href);
  return u.pathname.substring(1).replace(/\/$/, "");
};
export const goToEvent = (event) => {
  const { href } = window.location;
  const url = new URL(href);
  window.location = `${url.origin}/${event.id}/#/`;
  localStorage.setItem(
    "currEvent",
    JSON.stringify({
      name: event.name,
      hijriYear: event.hijriYear,
      slug: event.slug,
      zabihat: event.zabihat,
      chairs: event.chairs,
    })
  );
};

export const getCurrentEvent = () => {
  const jsonString = localStorage.getItem("currEvent");
  return JSON.parse(jsonString || "{}");
};
export const goToDashboard = () => {
  const { href } = window.location;
  const url = new URL(href);
  window.location = `${url.origin}/#/`;
};

export const goToLogin = () => {
  const { href } = window.location;
  const url = new URL(href);
  window.location = `${url.origin}/#/login`;
};

const getTimezoneOffset = (value) => value.getTimezoneOffset() * 60000;
export const parseDateTime = (value) => {
  const dateTime = new Date(value);
  const utcFromLocal = new Date(dateTime.getTime() - getTimezoneOffset(dateTime));
  return utcFromLocal;
};
export const formatDateTime = (value) => {
  const dateTime = new Date(value);
  const utcFromLocal = new Date(dateTime.getTime() + getTimezoneOffset(dateTime));
  return dayjs(utcFromLocal).format("YYYY-MM-DDTHH:mm");
};

export const formatDate = (value) => {
  const dateTime = new Date(value);
  const utcFromLocal = new Date(dateTime.getTime() + getTimezoneOffset(dateTime));
  return dayjs(utcFromLocal).format("DD-MM-YYYY");
};

export const groupBy = (key) => (array) =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    // eslint-disable-next-line no-param-reassign
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

export const receiptGroupBy = (array) =>
  array.reduce((acc, curr) => {
    const curMarkaz = acc[curr.markaz] || {};
    const curDay = curMarkaz[curr.day] || {};
    acc[curr.markaz] = {
      ...curMarkaz,
      [curr.day]: {
        ...curDay,
        [curr.mode]: curr.total_amount,
      },
    };
    return acc;
  }, {});

const downloadPDF = (blob) => {
  const url = window.URL.createObjectURL(blob);
  const aTag = document.createElement("a");
  aTag.href = url;
  aTag.setAttribute("target", "_blank");
  aTag.style = "display: none";
  // aTag.download = fileName;
  document.body.appendChild(aTag);
  aTag.click();
  return null;
};

export const downLoadPasses = async (row) => {
  const blob = await ReactPDF.pdf(
    <Passes
      familyMembers={row.familyMembers}
      HOFITS={row.HOFId}
      formNo={row.formNo}
      markaz={row.markaz}
      namaazVenue={row.namaazVenue}
      event={row.event}
    />
  ).toBlob();
  downloadPDF(blob, `${row.formNo}`);
};

export const calcTotalPayable = (currentEvent, data = {}) => {
  const takhmeenAmount = parseInt(data.takhmeenAmount, 10);
  const iftaari = parseInt(data.iftaari, 10);
  const chairs = currentEvent.chairs * parseInt(data.chairs, 10);
  const zabihat = currentEvent.zabihat * parseInt(data.zabihat, 10);
  return takhmeenAmount + chairs + zabihat + iftaari;
};

export const calcTotalBalance = (currentEvent, data = {}) => {
  const totalPayable = calcTotalPayable(currentEvent, data);
  const paidAmount = parseInt(data.paidAmount, 10);
  return totalPayable - paidAmount;
};

export const mS = !!(
  document.body.clientWidth >= 1024 || document.documentElement.clientWidth >= 1024
);

export const calcBookingTotals = (halls = []) =>
  halls.reduce(
    ({ rent, deposit, thaals, total }, { rent: r = 0, deposit: d = 0, thaals: t = 0 }) => {
      const hallTotal = r + d + t * PER_THAAL_COST;
      return {
        rent: rent + r,
        deposit: deposit + d,
        thaals: thaals + t,
        total: total + hallTotal,
      };
    },
    { rent: 0, deposit: 0, thaals: 0, total: 0 }
  );
