import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ToWords } from "to-words/en-IN";
import { useParams } from "react-router";
import CommonReceiptA5 from "@/components/common-receipt/CommonReceiptA5";
import { APP_DISPLAY_DATE } from "@/utils/date-format";
import { callApiWithoutAuth } from "@/dataprovider/misc-apis";
import type { RaRecord } from "react-admin";

const DepositReceiptPrint = () => {
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

  const booking = data.booking as
    | { bookingNo?: string; purpose?: string; mohalla?: string }
    | undefined;

  const receiptLines = [
    {
      left: "Received from",
      right: String(data.organiser || ""),
      bold: true,
    },
    {
      left: "ITS No.",
      right: `${data.organiserIts || "-"} / Reference No. ${booking?.bookingNo || "-"}`,
    },
    {
      left: "Purpose",
      right: `${booking?.purpose || "-"} / Mohalla ${booking?.mohalla || "-"}`,
    },
    {
      left: "Contribution Amount Rupees",
      right: `${toWords.convert(Number(data.amount) || 0)} Only`,
      bold: true,
    },
  ];

  return (
    <CommonReceiptA5
      title="FAKHRI MOHALLA JAMAAT"
      subTitle="Contribution Receipt"
      receiptNo={data?.receiptNo as string | undefined}
      date={data.date as string}
      dateFormat={APP_DISPLAY_DATE}
      receiptLines={receiptLines}
      amount={Number(data.amount)}
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
