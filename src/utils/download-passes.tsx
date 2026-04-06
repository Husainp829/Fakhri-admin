import type { ComponentType } from "react";
import ReactPDF from "@react-pdf/renderer";
import { Passes } from "@/components/pdf.js";

type PassesRow = {
  familyMembers?: unknown[];
  formNo?: string;
  markaz?: unknown;
  namaazVenue?: unknown;
  event?: unknown;
};

const PassesPdf = Passes as unknown as ComponentType<Record<string, unknown>>;

const downloadPDF = (blob: Blob): null => {
  const url = window.URL.createObjectURL(blob);
  const aTag = document.createElement("a");
  aTag.href = url;
  aTag.setAttribute("target", "_blank");
  aTag.style.display = "none";
  document.body.appendChild(aTag);
  aTag.click();
  return null;
};

export const downLoadPasses = async (row: PassesRow): Promise<null> => {
  const blob = await ReactPDF.pdf(
    <PassesPdf
      familyMembers={row.familyMembers}
      formNo={row.formNo}
      markaz={row.markaz}
      namaazVenue={row.namaazVenue}
      event={row.event}
    />
  ).toBlob();
  return downloadPDF(blob);
};
