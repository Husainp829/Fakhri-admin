import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ToWords } from "to-words/en-IN";
import { useParams } from "react-router";
import CommonReceiptA5 from "@/components/common-receipt/CommonReceiptA5";
import { callApiWithoutAuth } from "@/dataprovider/misc-apis";
import type { RaRecord } from "react-admin";

const RentReceiptPrint = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RaRecord | null>(null);
  const [error, setError] = useState(false);

  const toWords = new ToWords();

  useEffect(() => {
    if (!id) return;
    const fetchData = () => {
      callApiWithoutAuth({ location: "contRcpt", method: "GET", id })
        .then((res) => {
          const body = res.data as { rows?: RaRecord[] };
          const row = body.rows?.[0];
          setData(row ?? null);
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

  const paymentText =
    data?.mode === "ONLINE" ? `${data.mode} - (ref - ${data.ref})` : String(data.mode || "");

  const receiptLines = [
    {
      left: "Received from",
      right: `${data?.organiser || ""} ${data?.organiserIts ? `(ITS - ${data.organiserIts})` : ""}`,
      bold: true,
    },
    {
      left: "The sum of Rupees",
      right: `${toWords.convert(Number(data.amount) || 0)} Only`,
      bold: true,
    },
    {
      left: "Received by / Towards",
      right: `${paymentText} towards Voluntary Contribution`,
    },
  ];

  return (
    <CommonReceiptA5
      title="DAWOODI BOHRA JAMAAT TRUST"
      subTitle="Trust Reg No E/7038(P)"
      receiptNo={data?.receiptNo as string | undefined}
      date={data.date as string}
      dateFormat="DD/MM/YYYY"
      receiptLines={receiptLines}
      amount={Number(data.amount)}
      currency="₹"
      digitalSignatureValue={`${data.id}|${data.createdBy}`}
      qrCodeSize={100}
      digitalSignatureText="Digitally Signed"
      footerNote="VALID SUBJECT TO CLEARANCE. This receipt is computer generated and does not require a physical signature."
      showReceiptBadge
    />
  );
};

export default RentReceiptPrint;
