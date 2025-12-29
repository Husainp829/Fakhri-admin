import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ToWords } from "to-words";
import { useParams } from "react-router";
import CommonReceiptA5 from "../../../components/CommonReceipt/CommonReceiptA5";
import { callApiWithoutAuth } from "../../../dataprovider/miscApis";

const DepositReceiptPrint = () => {
  const { id } = useParams();
  const [data, setData] = useState();
  const [error, setError] = useState();

  const toWords = new ToWords();

  useEffect(() => {
    const fetchData = () => {
      callApiWithoutAuth({ location: "contRcpt", method: "GET", id })
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

  // Build receipt lines array
  const receiptLines = [
    {
      left: "Received from",
      right: data.organiser || "",
      bold: true,
    },
    {
      left: "ITS No.",
      right: `${data.organiserIts || "-"} / Reference No. ${data.booking?.bookingNo || "-"}`,
    },
    {
      left: "Purpose",
      right: `${data.booking?.purpose || "-"} / Mohalla ${data.booking?.mohalla || "-"}`,
    },
    {
      left: "Contribution Amount Rupees",
      right: `${toWords.convert(data.amount || 0)} Only`,
      bold: true,
    },
  ];

  return (
    <CommonReceiptA5
      title="FAKHRI MOHALLA JAMAAT"
      subTitle="Contribution Receipt"
      receiptNo={data?.receiptNo}
      date={data.date}
      dateFormat="DD/MM/YYYY"
      receiptLines={receiptLines}
      amount={data.amount}
      currency="₹"
      digitalSignatureValue={`${data.id}|${data.createdBy}`}
      qrCodeSize={100}
      digitalSignatureText="Digitally Signed"
      footerNote="This receipt is computer generated and does not require a physical signature."
      showReceiptBadge
    />
  );
};

export default DepositReceiptPrint;
