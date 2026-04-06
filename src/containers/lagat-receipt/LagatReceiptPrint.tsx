import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ToWords } from "to-words";
import { useParams } from "react-router";
import CommonReceiptA5 from "@/components/common-receipt/CommonReceiptA5";
import { callApiWithoutAuth } from "@/dataprovider/misc-apis";

const LagatReceiptPrint = () => {
  const { id } = useParams();
  const [data, setData] = useState<Record<string, unknown>>();
  const [error, setError] = useState<boolean>();

  const toWords = new ToWords();

  useEffect(() => {
    const fetchData = () => {
      callApiWithoutAuth({ location: "lagatReceipts", method: "GET", id })
        .then((res) => {
          const body = res.data as { rows?: Record<string, unknown>[] };
          setData(body.rows?.[0] || {});
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
  const paymentText: string =
    data.paymentMode === "ONLINE"
      ? `${String(data.paymentMode)} - (ref - ${String(data.paymentRef ?? "")})`
      : String(data.paymentMode ?? "");

  // Build receipt lines array
  const receiptLines = [
    {
      left: "Received from",
      right: `${String(data.name ?? "")} ${data.itsNo ? `(ITS - ${String(data.itsNo)})` : ""}`,
      bold: true,
    },
    {
      left: "The sum of Rupees",
      right: `${toWords.convert(Number(data.amount) || 0)} Only`,
      bold: true,
    },
    {
      left: "Received by",
      right: paymentText.toLowerCase(),
      capitalize: true,
    },
    {
      left: "Towards",
      right: String(data.purpose ?? "Voluntary Contribution"),
    },
  ];

  return (
    <CommonReceiptA5
      title="DAWOODI BOHRA JAMAAT TRUST"
      subTitle="Trust Reg No E/7038(P)"
      receiptNo={data.receiptNo != null ? String(data.receiptNo) : undefined}
      date={data.receiptDate as string | Date | undefined}
      dateFormat="DD/MM/YYYY"
      receiptLines={receiptLines}
      amount={Number(data.amount)}
      currency="₹"
      digitalSignatureValue={`${String(data.id)}|${String(data.updatedBy ?? data.createdBy ?? "")}`}
      qrCodeSize={100}
      digitalSignatureText="Digitally Signed"
      footerNote="VALID SUBJECT TO CLEARANCE. This receipt is computer generated and does not require a physical signature."
      showReceiptBadge
      receiptHeaderText="LAGAT RECEIPT"
    />
  );
};

export default LagatReceiptPrint;
