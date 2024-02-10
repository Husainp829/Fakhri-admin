import React from "react";
import dayjs from "dayjs";
import ReactPDF from "@react-pdf/renderer";
import { Passes, ReceiptsPDF } from "./components/pdf.js";
export const getEventId = () => {
  const { href } = window.location;
  const u = new URL(href);
  return u.pathname.substring(1).replace(/\/$/, "");
};
export const goToEvent = (id) => {
  const { href } = window.location;
  const url = new URL(href);
  window.location = `${url.origin}/${id}/#/`;
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
    />
  ).toBlob();
  downloadPDF(blob, `${row.formNo}`);
};

export const downloadReceipts = async (row) => {
  const blob = await ReactPDF.pdf(
    <ReceiptsPDF
      receipt={row}
      HOFITS={row.HOFId}
      HOFName={row.HOFName}
      formNo={row.formNo}
      markaz={row.markaz}
      total={row.total}
    />
  ).toBlob();
  downloadPDF(blob, `${row.receiptNo}`);
};
