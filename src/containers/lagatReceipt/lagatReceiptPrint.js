import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ToWords } from "to-words";
import { useParams } from "react-router";
import CommonReceiptA5 from "../../components/CommonReceipt/CommonReceiptA5";
import { callApiWithoutAuth } from "../../dataprovider/miscApis";

const LagatReceiptPrint = () => {
  const { id } = useParams();
  const [data, setData] = useState();
  const [error, setError] = useState();

  const toWords = new ToWords();

  useEffect(() => {
    const fetchData = () => {
      callApiWithoutAuth({ location: "lagatReceipts", method: "GET", id })
        .then(({ data: { rows } }) => {
          setData(rows?.[0] || {});
        })
        .catch(() => {
          setError(true);
        });
    };
    fetchData();
  }, [id]);

  if (error) {
    return <Box p={3}>No Results Found</Box>;
  }

  if (!data) {
    return <Box p={3}>...Loading</Box>;
  }

  // Format payment mode text
  const paymentText =
    data?.paymentMode === "ONLINE"
      ? `${data.paymentMode} - (ref - ${data.paymentRef})`
      : data.paymentMode || "";

  // Build receipt lines array
  const receiptLines = [
    {
      left: "Received from",
      right: `${data?.name || ""} ${data?.itsNo ? `(ITS - ${data.itsNo})` : ""}`,
      bold: true,
    },
    {
      left: "The sum of Rupees",
      right: `${toWords.convert(data.amount || 0)} Only`,
      bold: true,
    },
    {
      left: "Received by",
      right: paymentText.toLowerCase(),
      capitalize: true,
    },
    {
      left: "Towards",
      right: `${data.purpose || "Voluntary Contribution"}`,
    },
  ];

  return (
    <CommonReceiptA5
      title="DAWOODI BOHRA JAMAAT TRUST"
      subTitle="Trust Reg No E/7038(P)"
      receiptNo={data?.receiptNo}
      date={data.receiptDate}
      dateFormat="DD/MM/YYYY"
      receiptLines={receiptLines}
      amount={data.amount}
      currency="₹"
      digitalSignatureValue={`${data.id}|${data.updatedBy || data.createdBy}`}
      qrCodeSize={100}
      digitalSignatureText="Digitally Signed"
      footerNote="VALID SUBJECT TO CLEARANCE. This receipt is computer generated and does not require a physical signature."
      showReceiptBadge
      receiptHeaderText="LAGAT RECEIPT"
    />
  );
};

export default LagatReceiptPrint;
