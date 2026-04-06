import ReactPDF from "@react-pdf/renderer";
import { Passes, type PassesProps } from "@/components/pdf";

type PassesRow = Partial<PassesProps>;

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

export const downloadPasses = async (row: PassesRow): Promise<null> => {
  const blob = await ReactPDF.pdf(<Passes {...(row as PassesProps)} />).toBlob();
  return downloadPDF(blob);
};
