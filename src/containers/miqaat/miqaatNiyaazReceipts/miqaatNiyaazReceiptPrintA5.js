import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ToWords } from "to-words";
import { Box } from "@mui/material";
import { callApiWithoutAuth } from "../../../dataprovider/miscApis";
import CommonReceiptA5 from "../../../components/CommonReceipt/CommonReceiptA5";

const MiqaatNiyaazReceiptA5 = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const toWords = new ToWords();

  useEffect(() => {
    callApiWithoutAuth({
      location: "miqaatNiyaazReceipts",
      method: "GET",
      id,
    })
      .then(({ data: { rows } }) => setData(rows?.[0]))
      .catch(() => setError(true));
  }, [id]);

  if (error) return <Box p={3}>No Results Found</Box>;
  if (!data) return <Box p={3}>Loading…</Box>;

  // Format payment mode text
  const paymentText =
    data.paymentMode === "ONLINE"
      ? `${data.paymentMode} (Ref: ${data.paymentRef || "-"})`
      : data.paymentMode;

  // Build receipt lines array
  const receiptLines = [
    {
      left: "Received from",
      right: `${data.name}${data?.itsNo ? ` (ITS - ${data.itsNo})` : ""}`,
      bold: true,
    },
    {
      left: "The sum of Rupees",
      right: `${toWords.convert(data.amount || 0)} Only`,
      bold: true,
    },
    {
      left: "Received by",
      right: paymentText,
    },
    {
      left: "Towards",
      right: "Niyaz Voluntary Contribution",
      bold: true,
    },
  ];

  // Add purpose if exists
  if (data?.purpose) {
    receiptLines.push({
      left: "For",
      right: data.purpose,
    });
  }

  return (
    <CommonReceiptA5
      title="DAWOODI BOHRA JAMAAT TRUST"
      subTitle="Trust Reg No E/7038(P)"
      logoUrl="/logo512.png"
      receiptNo={data.receiptNo}
      date={data.receiptDate}
      dateFormat="DD/MM/YYYY"
      receiptLines={receiptLines}
      amount={data.amount}
      currency="₹"
      digitalSignatureValue={`${data.id}|${data.updatedBy || ""}`}
      qrCodeSize={90}
      digitalSignatureText="Digitally Verified"
      footerNote="This receipt is computer generated and does not require a physical signature."
      showReceiptBadge
    />
  );
};

export default MiqaatNiyaazReceiptA5;
